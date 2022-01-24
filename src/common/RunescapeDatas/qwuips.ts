const qwuips = [
  "Damn... where did I put it? AH! Here is that pesky {{itemName}}!",
  "Look searchin ain't easy, but I gotcha {{itemName}}!",
  "Found it! Here you go {{itemName}}!",
  "In an alternate universe, I found {{itemName}}!",
  "Brandon is a bitch, but I found {{itemName}}!",
  "I found {{itemName}}! I hope you like it!",
  "{{itemName}} is a real treasure! Here you go!",
  "{{itemName}}... {{itemName}}... this thing? I found it!",
  "Holy hell that was a real weird request, but I found {{itemName}}!",
  "I looked far and wide for {{itemName}}, high and low. Here you go!",
  "Looking for {{itemName}} gave me a real migrane.",
  "I found {{itemName}}, now can you get Stephen* (not Steven) to stop staring at me?",
]

export function qwuip (itemName: string) {
  const qwuip = qwuips[Math.floor(Math.random() * qwuips.length)];

  // replace all instances of {{itemName}} with the actual item name
  return qwuip.replace(/{{itemName}}/g, itemName);
}