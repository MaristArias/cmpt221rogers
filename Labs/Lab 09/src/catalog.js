const equipment = [
  { id: "camera-kit", name: "Camera Kit", available: true, maxHours: 24, restricted: true },
  { id: "audio-recorder", name: "Audio Recorder", available: true, maxHours: 48, restricted: false },
  { id: "tripod", name: "Tripod", available: false, maxHours: 72, restricted: false },
  { id: "tablet", name: "Tablet", available: true, maxHours: 8, restricted: true },
];

export async function loadEquipment() {
  return equipment.map((item) => ({ ...item }));
}
