import { useState } from "react";
export type Review = {
  kind: string;
  item: string;
  result: string;
  note: string;
  version: string;
  file?: File;
};
export function FieldReviews({
  values,
  change,
  customer,
  version,
}: {
  values: Review[];
  change: (v: Review[]) => void;
  customer: boolean;
  version: string;
}) {
  const [kind, K] = useState("Portal"),
    [error, E] = useState("");
  return (
    <details className="panel form-panel">
      <summary>Revisiones de la farmacia ({values.length})</summary>
      <p>
        Opcionales. Quedan asociadas a esta visita y no abren solicitudes
        externas.
      </p>
      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget),
            get = (k: string) => String(f.get(k) || "").trim(),
            file = f.get("file");
          if (!get("note")) return E("Describe lo observado.");
          if (
            file instanceof File &&
            file.size &&
            (file.size > 5 * 1024 * 1024 ||
              !["image/png", "image/jpeg", "application/pdf"].includes(
                file.type,
              ))
          )
            return E("Adjunta una foto JPG, PNG o un PDF de hasta 5 MB.");
          change([
            ...values,
            {
              kind,
              item: get("item"),
              result: get("result"),
              note: get("note"),
              version: kind === "Publicidad" ? version : "",
              file: file instanceof File && file.size ? file : undefined,
            },
          ]);
          e.currentTarget.reset();
          K("Portal");
          E("");
        }}
      >
        <label>
          Tipo de revisión
          <select value={kind} onChange={(e) => K(e.target.value)}>
            <option>Portal</option>
            <option>Publicidad</option>
            {customer && <option>Atención al cliente</option>}
          </select>
        </label>
        <label>
          Elemento
          <select key={kind} name="item">
            {(kind === "Portal"
              ? ["Navegación", "Errores", "Tareas"]
              : kind === "Publicidad"
                ? [
                    "Cubo · obligatorio",
                    "Pantalla · obligatoria",
                    "Otros · opcional",
                  ]
                : ["Parantes", "Señalética", "Otro elemento"]
            ).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select name="result" key={kind + "estado"}>
            {(kind === "Publicidad"
              ? [
                  "Conforme",
                  "Faltante",
                  "Dañado",
                  "Incorrecto",
                  "No verificado",
                ]
              : kind === "Portal"
                ? ["Conforme", "Seguimiento con Tecnología"]
                : ["Observación", "Alerta"]
            ).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Observación
          <textarea required name="note" maxLength={600} />
        </label>
        <label>
          Evidencia opcional
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
          />
        </label>
        {kind === "Publicidad" && <small>Lista utilizada: {version}</small>}
        <button className="secondary">Añadir revisión a la visita</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {values.map((v, i) => (
        <div className="simple-row" key={i}>
          <span>
            {v.kind} · {v.item} · {v.result}
          </span>
          <button
            className="text-btn"
            onClick={() => change(values.filter((_, j) => i !== j))}
          >
            Quitar
          </button>
        </div>
      ))}
    </details>
  );
}
export function ReviewHistory({ rows }: { rows: Review[] }) {
  return (
    <>
      {rows.map((r, i) => (
        <div className="person" key={i}>
          <h3>
            {r.kind} · {r.item}
          </h3>
          <p>
            {r.result} · {r.note}
          </p>
          {r.version && <small>Lista: {r.version}</small>}
          {r.file && (
            <button
              className="text-btn"
              onClick={() => {
                const url = URL.createObjectURL(r.file!),
                  link = document.createElement("a");
                link.href = url;
                link.download = r.file!.name;
                link.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
            >
              Descargar evidencia
            </button>
          )}
        </div>
      ))}
    </>
  );
}
