import { state } from "./state.js";
import { t } from "./i18n.js";
import { persistScore, measureNeededQuarters, quartersUsed, escapeHtml, plateLabel, trim } from "./storage.js";
import { emit } from "./events.js";

const MEASURES_PER_LINE = 4;
const LINES_PER_PAGE = 4;
const TOTAL_WIDTH = 990;
const RIGHT_MARGIN = 40;
const FIRST_OF_LINE_WIDTH = 322;
const REST_OF_LINE_WIDTH = 196;
const STAVE_GAP = 92;
const LINE_GAP = 180;
const TOP_MARGIN = 20;

function noteToVexKey(n) {
  return n.letter.toLowerCase() + (n.accidental === "#" || n.accidental === "b" ? n.accidental : "") + "/" + n.octave;
}

function beamGroupsFor(num, den, VF) {
  if (den === 8 && num % 3 === 0) return [new VF.Fraction(3, 8)];
  if (den === 8) return [new VF.Fraction(2, 8)];
  return [new VF.Fraction(1, 4)];
}

export function renderScore() {
  const score = state.currentScore;
  if (!score) return;
  persistScore(score);

  const container = document.getElementById("vexPagesContainer");
  if (!container) return;
  container.innerHTML = "";

  if (typeof Vex === "undefined") {
    container.innerHTML = '<p style="padding:40px;color:#8C2F39;font-weight:bold;">No se ha podido cargar VexFlow.</p>';
    return;
  }

  try {
    const VF = Vex.Flow;
    const measures = score.measures;
    const [num, den] = score.timeSig.split("/").map(Number);
    const totalLines = Math.ceil(measures.length / MEASURES_PER_LINE);
    const totalPages = Math.ceil(totalLines / LINES_PER_PAGE) || 1;

    for (let p = 0; p < totalPages; p++) {
      const pageDiv = document.createElement("div");
      pageDiv.className = "paper-page";

      let startY = TOP_MARGIN;
      if (p === 0) {
        const head = document.createElement("div");
        head.className = "score-letterhead";
        head.innerHTML = `<h2>${escapeHtml(score.title || t("untitled"))}</h2><p>${escapeHtml(score.composer || "")}</p>`;
        pageDiv.appendChild(head);
        startY += 85;
      }

      const svgWrap = document.createElement("div");
      pageDiv.appendChild(svgWrap);

      const printFooter = document.createElement("div");
      printFooter.className = "print-footer-content";
      printFooter.innerHTML = `<span style="display:flex; align-items:center; gap:10px;"><img src="assets/isotipo-w.png" class="print-logo-isotipo"> <strong>${plateLabel(score.plate)}</strong></span> <span>${p + 1} / ${totalPages}</span>`;
      pageDiv.appendChild(printFooter);
      
      container.appendChild(pageDiv);
      
      const linesOnThisPage = Math.min(LINES_PER_PAGE, totalLines - p * LINES_PER_PAGE);
      const pageHeight = startY + linesOnThisPage * LINE_GAP + 20;

      const renderer = new VF.Renderer(svgWrap, VF.Renderer.Backends.SVG);
      renderer.resize(TOTAL_WIDTH, pageHeight);
      const ctx = renderer.getContext();
      const hitRects = [];

      for (let l = 0; l < linesOnThisPage; l++) {
        const globalLineIdx = p * LINES_PER_PAGE + l;
        for (let m = 0; m < MEASURES_PER_LINE; m++) {
          const idx = globalLineIdx * MEASURES_PER_LINE + m;
          if (idx >= measures.length) break;

          const measure = measures[idx];
          const isFirstOfLine = m === 0;
          const width = isFirstOfLine ? FIRST_OF_LINE_WIDTH : REST_OF_LINE_WIDTH;
          const x = LEFT_MARGIN + (isFirstOfLine ? 0 : FIRST_OF_LINE_WIDTH + REST_OF_LINE_WIDTH * (m - 1));
          const yTreble = startY + l * LINE_GAP;
          const yBass = yTreble + STAVE_GAP;

          const staveTreble = new VF.Stave(x, yTreble, width);
          const staveBass = new VF.Stave(x, yBass, width);

          if (isFirstOfLine) {
            staveTreble.addClef("treble");
            staveBass.addClef("bass");
            if (score.keySig && score.keySig !== "C") {
              staveTreble.addKeySignature(score.keySig);
              staveBass.addKeySignature(score.keySig);
            }
          }

          if (idx === 0) {
            staveTreble.addTimeSignature(score.timeSig);
            staveBass.addTimeSignature(score.timeSig);
            staveTreble.setTempo({ duration: "q", dots: 0, bpm: score.bpm || 100 }, 0);
          }

          const noteStartOffset = isFirstOfLine ? 120 : 15;
          staveTreble.setNoteStartX(x + noteStartOffset);
          staveBass.setNoteStartX(x + noteStartOffset);

          staveTreble.setBegBarType(measure.repeatStart ? VF.Barline.type.REPEAT_BEGIN : VF.Barline.type.SINGLE);
          staveBass.setBegBarType(measure.repeatStart ? VF.Barline.type.REPEAT_BEGIN : VF.Barline.type.SINGLE);
          
          let endType = VF.Barline.type.SINGLE;
          if (measure.repeatEnd) {
            endType = VF.Barline.type.REPEAT_END;
          } else if (measure.directive === "Fine") {
            endType = VF.Barline.type.DOUBLE; 
          } else if (measure.directive && (measure.directive.includes("D.C.") || measure.directive.includes("D.S."))) {
            endType = VF.Barline.type.END;
          } else if (idx === measures.length - 1) {
            endType = VF.Barline.type.END;
          }
          
          staveTreble.setEndBarType(endType);
          staveBass.setEndBarType(endType);
          
          staveTreble.setContext(ctx).draw();
          staveBass.setContext(ctx).draw();

          if (isFirstOfLine) {
            new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.BRACE).setContext(ctx).draw();
            new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
          }
          
          let rightConnectorType = VF.StaveConnector.type.SINGLE_RIGHT;
          
          if (endType === VF.Barline.type.DOUBLE) {
            rightConnectorType = VF.StaveConnector.type.THIN_DOUBLE; 
          } else if (endType === VF.Barline.type.END || endType === VF.Barline.type.REPEAT_END) {
            rightConnectorType = VF.StaveConnector.type.BOLD_DOUBLE_RIGHT;
          }
          
          new VF.StaveConnector(staveTreble, staveBass).setType(rightConnectorType).setContext(ctx).draw();
          const buildNotes = (staffNotes, clef, staffName) => {
            const out = [];
            const restKey = clef === "bass" ? "d/3" : "b/4";
            staffNotes.forEach((n, nIdx) => {
              const durStr = n.duration + (n.dotted ? "d" : "") + (n.rest ? "r" : "");
              const keys = n.rest ? [restKey] : [noteToVexKey(n)];
              
              const sn = new VF.StaveNote({ clef, keys, duration: durStr, auto_stem: true });
              
              sn.setAttribute("id", `vf-note-${idx}-${staffName}-${nIdx}`);
              if (n.dotted) VF.Dot.buildAndAttach([sn], { all: true });
              if (!n.rest && n.accidental) sn.addModifier(new VF.Accidental(n.accidental), 0);
              if (n.dynamic) {
                sn.addModifier(
                  new VF.Annotation(n.dynamic)
                    .setFont("Times", 12, "italic bold")
                    .setVerticalJustification(clef === "bass" ? VF.Annotation.VerticalJustify.TOP : VF.Annotation.VerticalJustify.BOTTOM),
                  0
                );
              }
              out.push(sn);
            });
            return out;
          };

          let trebleNotes = [];
          let bassNotes = [];
          try {
            trebleNotes = buildNotes(measure.treble, "treble", "treble");
            bassNotes = buildNotes(measure.bass, "bass", "bass");

            const vTreble = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT);
            const vBass = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT);

            const voices = [];
            if (trebleNotes.length > 0) { vTreble.addTickables(trebleNotes); voices.push(vTreble); }
            if (bassNotes.length > 0) { vBass.addTickables(bassNotes); voices.push(vBass); }

            if (measure.directive) {
              const targetNotes = trebleNotes.length ? trebleNotes : bassNotes;
              const lastNote = targetNotes[targetNotes.length - 1];
              if (lastNote) {
                lastNote.addModifier(
                  new VF.Annotation(measure.directive)
                    .setFont("Times", 13, "italic bold")
                    .setVerticalJustification(VF.Annotation.VerticalJustify.TOP),
                  0
                );
              }
            }

            if (voices.length > 0) {
              const innerWidth = width - noteStartOffset - 15;
              const formatter = new VF.Formatter();
              try {
                formatter.joinVoices(voices).format(voices, innerWidth);
              } catch (e) {
                voices.forEach((v) => {
                  const f = new VF.Formatter();
                  f.joinVoices([v]).format([v], innerWidth);
                });
              }
            }
            
            let trebleBeams = [];
            let bassBeams = [];
            
            if (trebleNotes.length > 0) {
              try {
                trebleBeams = VF.Beam.generateBeams(trebleNotes, { groups: beamGroupsFor(num, den, VF), beam_rests: false });
              } catch (e) { console.warn("Beam treble (measure " + (idx + 1) + ")", e); }
            }

            if (bassNotes.length > 0) {
              try {
                bassBeams = VF.Beam.generateBeams(bassNotes, { groups: beamGroupsFor(num, den, VF), beam_rests: false });
              } catch (e) { console.warn("Beam bass (measure " + (idx + 1) + ")", e); }
            }

            if (trebleNotes.length > 0) vTreble.draw(ctx, staveTreble);
            if (bassNotes.length > 0) vBass.draw(ctx, staveBass);

            trebleBeams.forEach((b) => b.setContext(ctx).draw());
            bassBeams.forEach((b) => b.setContext(ctx).draw());

          } catch (measureErr) {
            console.error("Error renderizando el compás " + (idx + 1), measureErr);
            const ns = "http://www.w3.org/2000/svg";
            const errText = document.createElementNS(ns, "text");
            errText.setAttribute("x", x + 10);
            errText.setAttribute("y", yTreble + 20);
            errText.setAttribute("fill", "#8C2F39");
            errText.setAttribute("font-size", "11");
            errText.textContent = "⚠ compás " + (idx + 1);
            ctx.svg.appendChild(errText);
          }

          const hitX = staveTreble.getNoteStartX() - 8;
          const hitRight = staveTreble.getX() + staveTreble.getWidth(); 
          const finalHitWidth = hitRight - hitX;
          
          hitRects.push({
            x: hitX, y: staveTreble.getYForLine(0) - 25,
            width: finalHitWidth, height: staveBass.getYForLine(4) - staveTreble.getYForLine(0) + 50,
            startX: staveTreble.getNoteStartX(), endX: staveTreble.getNoteEndX(), idx
          });
        }
      }

      const svg = svgWrap.querySelector("svg");
      if (svg) {
        svg.setAttribute("viewBox", `0 0 ${TOTAL_WIDTH} ${pageHeight}`);
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        const ns = "http://www.w3.org/2000/svg";
        hitRects.forEach((hr) => {
          const g = document.createElementNS(ns, "g");
          g.setAttribute("class", "measure-hit" + (hr.idx === state.editorState.activeMeasure ? " active" : ""));
          g.setAttribute("data-measure-idx", hr.idx);
          g.setAttribute("data-start-x", hr.startX);
          g.setAttribute("data-end-x", hr.endX);
          g.setAttribute("data-y", hr.y);
          g.setAttribute("data-h", hr.height);

          const rect = document.createElementNS(ns, "rect");
          rect.setAttribute("x", hr.x); rect.setAttribute("y", hr.y);
          rect.setAttribute("width", hr.width); rect.setAttribute("height", hr.height);
          rect.setAttribute("fill", hr.idx === state.editorState.activeMeasure ? "rgba(179, 142, 80, 0.15)" : "transparent");
          rect.setAttribute("rx", "4");
          g.appendChild(rect);
          g.addEventListener("click", () => {
            state.editorState.activeMeasure = hr.idx;
            emit("measureselected", hr.idx);
            renderScore();
          });
          svg.insertBefore(g, svg.firstChild);
        });
      }
    }

    const needed = measureNeededQuarters(score.timeSig);
    const m = score.measures[state.editorState.activeMeasure];
    const lbl = document.getElementById("activeMeasureLabel");
    if (lbl) {
      lbl.textContent = `${state.editorState.activeMeasure + 1}/${score.measures.length} · ♩ Sol ${trim(quartersUsed(m.treble))}/${trim(needed)} · Fa ${trim(quartersUsed(m.bass))}/${trim(needed)}`;
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="padding:40px;color:#8C2F39;font-weight:bold;">Error de renderizado VexFlow.</p>';
  }
}
