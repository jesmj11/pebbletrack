// Nature-themed avatar system for Pebble Track
export interface NatureAvatar {
  id: string;
  name: string;
  emoji: string;
  backgroundColor: string;
  category: 'forest' | 'ocean' | 'mountain' | 'garden' | 'wildlife';
}

export const natureAvatars: NatureAvatar[] = [
  // Forest creatures
  { id: 'fox', name: 'Forest Fox', emoji: '🦊', backgroundColor: '#8BA88E', category: 'forest' },
  { id: 'deer', name: 'Woodland Deer', emoji: '🦌', backgroundColor: '#7E8A97', category: 'forest' },
  { id: 'owl', name: 'Wise Owl', emoji: '🦉', backgroundColor: '#A8C7DD', category: 'forest' },
  { id: 'squirrel', name: 'Busy Squirrel', emoji: '🐿️', backgroundColor: '#F5F2EA', category: 'forest' },
  { id: 'rabbit', name: 'Garden Rabbit', emoji: '🐰', backgroundColor: '#D9E5D1', category: 'forest' },
  
  // Ocean life
  { id: 'dolphin', name: 'Playful Dolphin', emoji: '🐬', backgroundColor: '#A8C7DD', category: 'ocean' },
  { id: 'turtle', name: 'Sea Turtle', emoji: '🐢', backgroundColor: '#8BA88E', category: 'ocean' },
  { id: 'octopus', name: 'Smart Octopus', emoji: '🐙', backgroundColor: '#7E8A97', category: 'ocean' },
  { id: 'whale', name: 'Gentle Whale', emoji: '🐋', backgroundColor: '#3E4A59', category: 'ocean' },
  { id: 'fish', name: 'Tropical Fish', emoji: '🐠', backgroundColor: '#A8C7DD', category: 'ocean' },
  
  // Mountain wildlife
  { id: 'eagle', name: 'Mountain Eagle', emoji: '🦅', backgroundColor: '#3E4A59', category: 'mountain' },
  { id: 'bear', name: 'Mountain Bear', emoji: '🐻', backgroundColor: '#7E8A97', category: 'mountain' },
  { id: 'wolf', name: 'Mountain Wolf', emoji: '🐺', backgroundColor: '#8BA88E', category: 'mountain' },
  
  // Garden friends
  { id: 'butterfly', name: 'Garden Butterfly', emoji: '🦋', backgroundColor: '#D9E5D1', category: 'garden' },
  { id: 'bee', name: 'Busy Bee', emoji: '🐝', backgroundColor: '#F5F2EA', category: 'garden' },
  { id: 'ladybug', name: 'Lucky Ladybug', emoji: '🐞', backgroundColor: '#8BA88E', category: 'garden' },
  { id: 'frog', name: 'Pond Frog', emoji: '🐸', backgroundColor: '#D9E5D1', category: 'garden' },
  
  // Wildlife
  { id: 'elephant', name: 'Wise Elephant', emoji: '🐘', backgroundColor: '#7E8A97', category: 'wildlife' },
  { id: 'lion', name: 'Brave Lion', emoji: '🦁', backgroundColor: '#F5F2EA', category: 'wildlife' },
  { id: 'giraffe', name: 'Tall Giraffe', emoji: '🦒', backgroundColor: '#D9E5D1', category: 'wildlife' },
  { id: 'panda', name: 'Peaceful Panda', emoji: '🐼', backgroundColor: '#3E4A59', category: 'wildlife' },
];

export function getRandomNatureAvatar(): NatureAvatar {
  return natureAvatars[Math.floor(Math.random() * natureAvatars.length)];
}

export function getAvatarById(id: string): NatureAvatar | undefined {
  return natureAvatars.find(avatar => avatar.id === id);
}

export function getAvatarsByCategory(category: NatureAvatar['category']): NatureAvatar[] {
  return natureAvatars.filter(avatar => avatar.category === category);
}

export function getAvatarForStudent(studentName: string): NatureAvatar {
  // Create a consistent avatar based on student name
  const hash = studentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return natureAvatars[hash % natureAvatars.length];
}