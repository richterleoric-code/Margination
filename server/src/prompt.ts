export function buildIllustrationPrompt(passage: string): string {
  return [
    "Create one illustration for a reader who wants help imagining a written passage.",
    "The picture supports the reading. It is not a poster, a titled book cover, or a comic strip.",
    "",
    "Visual style:",
    "- Simple, expressive line art with clean dark charcoal outlines.",
    "- Flat color only, in a limited palette: bright soft pink, fresh leaf green, warm cream, and dark charcoal.",
    "- Warm cream background, generous negative space, and one clear focal scene.",
    "- Soft and approachable for readers of different ages. Editorial and story-driven.",
    "- No photorealism, no glossy 3D, no cluttered detail, and no frightening imagery.",
    "",
    "Content rules:",
    "- Preserve the meaning, atmosphere, setting, and relevant details of the passage.",
    "- Do not invent events, characters, or objects that the passage does not suggest.",
    "- If the passage is quiet or abstract, show its mood and setting simply.",
    "- Do not include any written text, letters, numbers, captions, watermarks, signatures, speech bubbles, or typography.",
    "",
    "Passage to illustrate:",
    '"""',
    passage.trim(),
    '"""',
  ].join("\n");
}
