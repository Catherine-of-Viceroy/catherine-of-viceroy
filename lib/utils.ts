interface RandomizableItem {
  randomizeOrder?: boolean;
  [key: string]: any;
}

/**
 * Shuffles items marked with randomizeOrder: true among themselves,
 * while keeping items with randomizeOrder: false (or undefined) in their fixed positions.
 * 
 * @example
 * Input:  [{ id: 1, randomizeOrder: false }, { id: 2, randomizeOrder: true }, { id: 3, randomizeOrder: true }, { id: 4, randomizeOrder: false }]
 * Output: [{ id: 1, randomizeOrder: false }, { id: 3, randomizeOrder: true }, { id: 2, randomizeOrder: true }, { id: 4, randomizeOrder: false }]
 */
export function shuffleRandomizableItems<T extends RandomizableItem>(items: T[]): T[] {
  if (!items || items.length === 0) return [];

  // Separate randomizable and fixed items
  const randomizable: T[] = [];
  const fixed: T[] = [];
  
  items.forEach((item) => {
    if (item.randomizeOrder === true) {
      randomizable.push(item);
    } else {
      fixed.push(item);
    }
  });

  // If no randomizable items, return original
  if (randomizable.length === 0) return [...items];

  // Fisher-Yates shuffle for randomizable items
  for (let i = randomizable.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomizable[i], randomizable[j]] = [randomizable[j], randomizable[i]];
  }

  // Track indices for each group
  let randomizableIndex = 0;
  let fixedIndex = 0;

  // Reconstruct array maintaining original positions
  return items.map((originalItem) => {
    if (originalItem.randomizeOrder === true) {
      return randomizable[randomizableIndex++];
    } else {
      return fixed[fixedIndex++];
    }
  });
}
