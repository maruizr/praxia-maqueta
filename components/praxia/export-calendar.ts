import type { Session } from "./resources";
export function exportCalendar(sessions: Session[]) {
  const c = document.createElement("canvas");
  c.width = 1400;
  c.height = 1080;
  const g = c.getContext("2d");
  if (!g) return;
  g.fillStyle = "#f7f8f3";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#103d34";
  g.fillRect(0, 0, 1400, 150);
  g.fillStyle = "white";
  g.font = "bold 38px Arial";
  g.fillText("Praxia · Simi Escuela", 45, 68);
  g.font = "24px Arial";
  g.fillText("Calendario de noviembre de 2026", 45, 115);
  ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].forEach((x, i) => {
    g.fillStyle = "#476053";
    g.fillText(x, 48 + i * 189, 204);
  });
  for (let day = 1; day <= 30; day++) {
    const pos = day + 5,
      x = 40 + (pos % 7) * 189,
      y = 235 + Math.floor(pos / 7) * 130;
    const s = sessions.find((o) => o.day === day);
    g.fillStyle = s ? "#dce9d3" : "white";
    g.fillRect(x, y, 184, 125);
    g.fillStyle = "#173f31";
    g.font = "bold 22px Arial";
    g.fillText(String(day), x + 10, y + 32);
    if (s) {
      g.font = "18px Arial";
      let line = "",
        n = 0;
      for (const w of s.title.split(/\s+/)) {
        if (g.measureText(line + w).width > 162) {
          g.fillText(line, x + 10, y + 63 + n * 20);
          line = "";
          n++;
        }
        line += w + " ";
      }
      g.fillText(line, x + 10, y + 63 + n * 20);
    }
  }
  const a = document.createElement("a");
  a.download = "Praxia-Simi-Escuela-noviembre-2026.png";
  a.href = c.toDataURL("image/png");
  a.click();
}
