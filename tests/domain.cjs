const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
require.extensions[".ts"] = (mod, file) =>
  mod._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    file,
  );
const {
  pending,
  reconcileTasks,
  outstanding,
  metrics,
} = require("../components/praxia/records.ts");
const { today } = require("../components/praxia/data.ts");
const { parseBatch } = require("../components/praxia/import-data.ts");
const person = {
  id: "CL0090-1000",
  name: "Luisa Prado",
  topics: ["A", "B"],
  evaluations: {
    A: { result: "Requiere seguimiento", kind: "Enviar material", date: today },
    B: {
      result: "Reservada para una fecha",
      kind: "Nueva capacitación",
      date: today,
    },
  },
};
const visit = {
  id: "ejemplo",
  store: "CL0090",
  date: today,
  author: "Camila Morales",
  mode: "Presencial",
  actions: [{ uid: "a", type: "Capacitación", persons: [person] }],
};
test("Cada tema que requiere una acción genera un pendiente distinto", () => {
  assert.equal(pending(visit).length, 2);
  assert.notEqual(pending(visit)[0].id, pending(visit)[1].id);
});
test("Quitar a una persona cancela los abiertos y conserva los completados", () => {
  const tasks = pending(visit);
  tasks[0].closed = true;
  tasks[0].closure = { action: "Completado", result: "Material recibido" };
  const next = reconcileTasks(tasks, { ...visit, actions: [] });
  assert.deepEqual(next[0], tasks[0]);
  assert.equal(next[1].cancelled, true);
});
test("Anulación y restauración conservan el vínculo sin duplicados", () => {
  const initial = pending(visit),
    cancelled = reconcileTasks(initial, { ...visit, annulled: true });
  assert.ok(cancelled.every((t) => t.cancelled));
  assert.deepEqual(reconcileTasks(cancelled, visit), initial);
});
test("Un intento o una visita anulada no cumplen el plan", () => {
  const previous = "2025-01-01";
  assert.ok(
    outstanding(previous, "CL0090", [
      { ...visit, date: previous, attempt: "Cerrada" },
    ]),
  );
  assert.ok(
    outstanding(previous, "CL0090", [
      { ...visit, date: previous, annulled: true },
    ]),
  );
  assert.equal(
    outstanding(previous, "CL0090", [{ ...visit, date: previous }]),
    false,
  );
});
test("Cobertura cuenta farmacias únicas del mes", () => {
  assert.equal(
    metrics(
      [visit, visit, { ...visit, store: "F0373", annulled: true }],
      ["CL0090", "F0373"],
    ).coverage,
    50,
  );
});
test("Una cartera mensual duplicada se rechaza con número de fila", () => {
  const row = "CL0090;Camila Morales;" + today.slice(0, 7) + ";Cobertura";
  const parsed = parseBatch(
    "farmacia;nutricionista;mes;justificacion\n" + row + "\n" + row,
    "Carteras",
    "ejemplo.csv",
  );
  assert.equal(parsed.errors.length, 1);
  assert.match(parsed.errors[0], /Fila 3/);
});
