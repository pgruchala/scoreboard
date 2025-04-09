import React, { useRef, useEffect, useState } from "react";

// Rozmiary komórki (LCD: 5x8 pikseli) i skalowanie dla lepszej widoczności
const cellWidth = 5;
const cellHeight = 8;
const scale = 4;
const cols = 16;
const rows = 2;
const canvasWidth = cols * cellWidth * scale;   // 16 * 5 * 4 = 320
const canvasHeight = rows * cellHeight * scale;   // 2 * 8 * 4 = 64

// Definicje bitmap (sprity) – zgodnie z kodem Arduino
const spriteRun1 = [
  0b01100,
  0b01100,
  0b00000,
  0b01110,
  0b11100,
  0b01100,
  0b11010,
  0b10011,
];

const spriteRun2 = [
  0b01100,
  0b01100,
  0b00000,
  0b01100,
  0b01100,
  0b01100,
  0b01100,
  0b01110,
];

const spriteJump = [
  0b01100,
  0b01100,
  0b00000,
  0b11110,
  0b01101,
  0b11111,
  0b10000,
  0b00000,
];

const spriteJumpLower = [
  0b11110,
  0b01101,
  0b11111,
  0b10000,
  0b00000,
  0b00000,
  0b00000,
  0b00000,
];

const spriteGround = [
  0b11111,
  0b11111,
  0b11111,
  0b11111,
  0b11111,
  0b11111,
  0b11111,
  0b11111,
];

const spriteGroundRight = [
  0b00011,
  0b00011,
  0b00011,
  0b00011,
  0b00011,
  0b00011,
  0b00011,
  0b00011,
];

const spriteGroundLeft = [
  0b11000,
  0b11000,
  0b11000,
  0b11000,
  0b11000,
  0b11000,
  0b11000,
  0b11000,
];

// Funkcja rysująca dany sprite w określonej komórce planszy
function drawSprite(ctx, sprite, cellCol, cellRow) {
  const offsetX = cellCol * cellWidth * scale;
  const offsetY = cellRow * cellHeight * scale;
  ctx.fillStyle = "white";
  for (let row = 0; row < cellHeight; row++) {
    const bits = sprite[row];
    for (let col = 0; col < cellWidth; col++) {
      // Sprawdzamy, czy dany piksel ma być wypełniony (licząc od lewej)
      const mask = 1 << (cellWidth - 1 - col);
      if (bits & mask) {
        ctx.fillRect(offsetX + col * scale, offsetY + row * scale, scale, scale);
      }
    }
  }
}

// Funkcja rysująca kropkę (dla górnej części skoku)
function drawDot(ctx, cellCol, cellRow) {
  const offsetX = cellCol * cellWidth * scale;
  const offsetY = cellRow * cellHeight * scale;
  ctx.fillStyle = "white";
  const dotSize = scale;
  ctx.fillRect(offsetX + 2 * scale, offsetY + 3 * scale, dotSize, dotSize);
}

const Ludzik = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameCount = 0;
    const totalFrames = 320; // Zwiększona liczba klatek – animacja jest wolniejsza

    // Ustalenie przedziału dla skoku
    const jumpStartFrame = 31;
    const jumpEndFrame = 54; // 24 klatki skoku

    const animate = () => {
      // Czyścimy canvas – tło czarne
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Obliczamy pozycję horyzontalną ludzika
      const heroXFloat = -1 + (frameCount / totalFrames) * (cols + 1);
      const heroCol = Math.round(heroXFloat);

      // Ustalamy stan animacji ludzika
      // - Poza przedziałem skoku: "run"
      // - W przedziale skoku: dzielimy sekwencję na 8 faz, każda trwająca 3 klatki (0-7)
      let heroState = "run";
      if (frameCount >= jumpStartFrame && frameCount <= jumpEndFrame) {
        const seqPhase = Math.floor((frameCount - jumpStartFrame) / 3); // 0 do 7
        switch (seqPhase) {
          case 0:
            heroState = "jump1";
            break;
          case 1:
            heroState = "jump2";
            break;
          case 2:
            heroState = "jump3";
            break;
          case 3:
            heroState = "jump4";
            break;
          case 4:
            heroState = "jump5";
            break;
          case 5:
            heroState = "jump6";
            break;
          case 6:
            heroState = "jump7";
            break;
          case 7:
            heroState = "jump8";
            break;
          default:
            heroState = "run";
        }
      } else {
        heroState = "run";
      }

      // Dostosowanie animacji biegu – zmiana sprite'ów co 20 klatek, aby ruch był płynniejszy
      const runningSprite = Math.floor(frameCount / 20) % 2 === 0 ? spriteRun1 : spriteRun2;

      // Rysujemy przeszkodę – umieszczoną w centralnej kolumnie (8) w dolnym rzędzie
      const obstacleCol = 8;
      drawSprite(ctx, spriteGround, obstacleCol, 1);

      // Rysujemy ludzika w zależności od stanu animacji
      if (heroState === "run") {
        // Ludzika biegnący – rysowany w dolnym rzędzie
        if (heroCol >= 0 && heroCol < cols) {
          drawSprite(ctx, runningSprite, heroCol, 1);
        }
      } else if (heroState === "jump1" || heroState === "jump8") {
        // Klatki skoku, gdzie ludzika nadal jest rysowany w dolnym rzędzie (spriteJump)
        if (heroCol >= 0 && heroCol < cols) {
          drawSprite(ctx, spriteJump, heroCol, 1);
        }
      } else if (heroState === "jump2" || heroState === "jump7") {
        // Ludzika rozciąga się na obie linie – górna linia: kropka (głowa), dolna: spriteJumpLower
        if (heroCol >= 0 && heroCol < cols) {
          drawDot(ctx, heroCol, 0);
          drawSprite(ctx, spriteJumpLower, heroCol, 1);
        }
      } else if (
        heroState === "jump3" ||
        heroState === "jump4" ||
        heroState === "jump5" ||
        heroState === "jump6"
      ) {
        // Ludzika podczas lotu – rysowany tylko w górnym rzędzie (spriteJump)
        if (heroCol >= 0 && heroCol < cols) {
          drawSprite(ctx, spriteJump, heroCol, 0);
        }
      }

      frameCount = (frameCount + 1) % (totalFrames + 1);
      setFrame(frameCount);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{ border: "1px solid white" }}
    />
  );
};

export default Ludzik;