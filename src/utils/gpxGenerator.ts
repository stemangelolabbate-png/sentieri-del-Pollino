import { Trail } from '../types';

export function generateGpxString(trail: Trail): string {
  const pointsXml = trail.coordinates
    .map((coord, index) => {
      // Estimate elevation proportionally from elevationProfile if available
      const progress = trail.coordinates.length > 1 ? index / (trail.coordinates.length - 1) : 0;
      const elevIndex = Math.min(
        Math.floor(progress * trail.elevationProfile.length),
        trail.elevationProfile.length - 1
      );
      const ele = trail.elevationProfile[elevIndex]?.altitude || trail.minAltitude;

      return `      <trkpt lat="${coord[0].toFixed(6)}" lon="${coord[1].toFixed(6)}">
        <ele>${ele}</ele>
        <time>${new Date().toISOString()}</time>
      </trkpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Sentieri del Pollino - App Guida Parco Nazionale" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${trail.caiNumber ? `${trail.caiNumber} - ` : ''}${trail.name}</name>
    <desc>${trail.subtitle}. Dislivello: +${trail.elevationGain}m. Lunghezza: ${trail.lengthKm} km. Difficoltà: ${trail.difficulty}.</desc>
    <author>
      <name>Parco Nazionale del Pollino</name>
    </author>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${trail.name}</name>
    <type>Hiking</type>
    <trkseg>
${pointsXml}
    </trkseg>
  </trk>
</gpx>`;
}

export function downloadGpxFile(trail: Trail): void {
  const gpxContent = generateGpxString(trail);
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeFilename = (trail.caiNumber || trail.name)
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_');
  link.href = url;
  link.download = `${safeFilename}.gpx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
