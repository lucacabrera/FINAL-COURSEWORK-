class WeatherDiagrams {
  // WIND ROSE DIAGRAM
  static drawWindRose(hourlyWindData) {
    new p5((p) => {
      p.setup = () => {
        const container = document.getElementById("diagram-container");
        container.innerHTML = ""; 
        p.createCanvas(350, 350).parent(container);
        p.angleMode(p.DEGREES);
        p.textSize(12);
      };

      const compass = [
        { label: "N", angle: 0 },
        { label: "NE", angle: 45 },
        { label: "E", angle: 90 },
        { label: "SE", angle: 135 },
        { label: "S", angle: 180 },
        { label: "SW", angle: 225 },
        { label: "W", angle: 270 },
        { label: "NW", angle: 315 },
      ];

      p.draw = () => {
        p.background(240);
        p.translate(p.width / 2, p.height / 2);

        const maxWind = 30;
        const interval = 5;
        const radiusScale = 120;

        //speed cirlces
        p.stroke(180);
        p.noFill();
        for (let i = interval; i <= maxWind; i += interval) {
          let r = (i / maxWind) * radiusScale;
          p.ellipse(0, 0, r * 2, r * 2);

          //label circle speeds
          p.noStroke();
          p.fill(0);
          p.textAlign(p.LEFT, p.CENTER);
          p.text(i, r + 5, 0);
          p.stroke(180);
          p.noFill();
        }

        //draw compass labels
        const labelRadius = radiusScale + 20;
        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        compass.forEach((point) => {
          const angle = -90 + point.angle; //rotate so N points up
          const x = labelRadius * p.cos(angle);
          const y = labelRadius * p.sin(angle);
          p.text(point.label, x, y);
        });

        //draw wind arrows
        if (hourlyWindData && hourlyWindData.length) {
          hourlyWindData.forEach((wind, index) => {
            p.push();
            const arrowAngle = -90 + wind.degree; //rotate so N = up

            //colour gradient from blue (slow) to red (fast)
            const speedNorm = Math.min(wind.speed / maxWind, 1);
            const col = p.lerpColor(
              p.color(0, 100, 255), 
              p.color(255, 0, 0), 
              speedNorm
            );

            //dade older arrows
            const alpha = 50 + (index / hourlyWindData.length) * 205;
            p.stroke(col.levels[0], col.levels[1], col.levels[2], alpha);
            p.strokeWeight(2);

            const arrowLength = (wind.speed / maxWind) * radiusScale;

            //draw arrows
            p.line(0, 0, 0, -arrowLength);

            //draw arrowheads
            const headSize = 6;
            p.line(0, -arrowLength, -headSize, -arrowLength + headSize);
            p.line(0, -arrowLength, headSize, -arrowLength + headSize);

            p.pop();
          });
        }

        p.noLoop();
      };
    });
  }

  // TEMPERATURE + WIND GRAPH
  static drawTemperatureGraph(hourlyData) {
    new p5((p) => {
      p.setup = () => {
        const container = document.getElementById("diagram-container");
        container.innerHTML = ""; 
        const canvas = p.createCanvas(400, 200);
        canvas.parent(container);
        p.background(245);
        p.textAlign(p.CENTER, p.CENTER);
        p.noLoop();
      };

      p.draw = () => {
        p.background(245);
        const margin = 40;
        const graphWidth = p.width - 2 * margin;
        const graphHeight = p.height - 2 * margin;

        //draw axes
        p.stroke(0);
        p.line(margin, margin, margin, p.height - margin); //y-axis
        p.line(margin, p.height - margin, p.width - margin, p.height - margin); //x-axis

        //labels
        p.fill(0);
        p.text("Hours", p.width / 2, p.height - margin / 2);
        p.push();
        p.translate(margin / 2, p.height / 2);
        p.rotate(-p.HALF_PI);
        p.text("Temperature (°C)", 0, 0);
        p.pop();

        //min/max temperatures
        const temps = hourlyData.map((d) => d.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);

        //temperature line
        p.stroke("red");
        p.noFill();
        p.beginShape();
        hourlyData.forEach((d, i) => {
          const x = margin + (i / (hourlyData.length - 1)) * graphWidth;
          const y = p.map(d.temp, minTemp, maxTemp, p.height - margin, margin);
          p.vertex(x, y);
        });
        p.endShape();

        //plot blue circles
        hourlyData.forEach((d, i) => {
          const x = margin + (i / (hourlyData.length - 1)) * graphWidth;
          const y = p.map(d.temp, minTemp, maxTemp, p.height - margin, margin);
          p.fill("blue");
          p.noStroke();
          p.ellipse(x, y - d.wind / 2, 5, 5);
        });
      };
    });
  }
}

export default WeatherDiagrams;
