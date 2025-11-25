/**
 * Avatar Collection
 *
 * Collection of avatar options for users (male and female)
 */

export interface Avatar {
  id: string
  name: string
  description: string
  gender: 'male' | 'female'
  imageUrl: string
}

const avatarUrl = (filename: string) => `/assets/avatars/${filename}`

export const AVATARS: Avatar[] = [
  // Male Avatars
  {
    id: 'avatar-1',
    name: 'Alex',
    description: 'Crew Cut',
    gender: 'male',
    imageUrl: avatarUrl('avatar-1.png'),
  },
  {
    id: 'avatar-2',
    name: 'Marco',
    description: 'Bald with Beard',
    gender: 'male',
    imageUrl: avatarUrl('avatar-2.png'),
  },
  {
    id: 'avatar-3',
    name: 'David',
    description: 'Curly Hair',
    gender: 'male',
    imageUrl: avatarUrl('avatar-3.png'),
  },
  {
    id: 'avatar-4',
    name: 'Michael',
    description: 'Slick Back',
    gender: 'male',
    imageUrl: avatarUrl('avatar-4.png'),
  },
  {
    id: 'avatar-5',
    name: 'Ryan',
    description: 'Undercut',
    gender: 'male',
    imageUrl: avatarUrl('avatar-5.png'),
  },
  {
    id: 'avatar-6',
    name: 'Tyler',
    description: 'Spiky',
    gender: 'male',
    imageUrl: avatarUrl('avatar-6.png'),
  },
  {
    id: 'avatar-7',
    name: 'Mo',
    description: 'Side-Swept',
    gender: 'male',
    imageUrl: avatarUrl('avatar-7.png'),
  },
  {
    id: 'avatar-8',
    name: 'Jordan',
    description: 'Dreadlocks',
    gender: 'male',
    imageUrl: avatarUrl('avatar-8.png'),
  },
  {
    id: 'avatar-9',
    name: 'Daniel',
    description: 'Fade Cut',
    gender: 'male',
    imageUrl: avatarUrl('avatar-9.png'),
  },
  {
    id: 'avatar-10',
    name: 'Kevin',
    description: 'Short Hair',
    gender: 'male',
    imageUrl: avatarUrl('avatar-10.png'),
  },

  // Female Avatars
  {
    id: 'avatar-11',
    name: 'Sarah',
    description: 'Long Hair',
    gender: 'female',
    imageUrl: avatarUrl('avatar-11.png'),
  },
  {
    id: 'avatar-12',
    name: 'Aisha',
    description: 'Hijab',
    gender: 'female',
    imageUrl: avatarUrl('avatar-12.png'),
  },
  {
    id: 'avatar-13',
    name: 'Emma',
    description: 'Ponytail',
    gender: 'female',
    imageUrl: avatarUrl('avatar-13.png'),
  },
  {
    id: 'avatar-14',
    name: 'Lisa',
    description: 'Bob Cut',
    gender: 'female',
    imageUrl: avatarUrl('avatar-14.png'),
  },
  {
    id: 'avatar-15',
    name: 'Nina',
    description: 'Wavy Medium',
    gender: 'female',
    imageUrl: avatarUrl('avatar-15.png'),
  },
  {
    id: 'avatar-16',
    name: 'Fatima',
    description: 'Colorful Hijab',
    gender: 'female',
    imageUrl: avatarUrl('avatar-16.png'),
  },
  {
    id: 'avatar-17',
    name: 'Maya',
    description: 'Pixie',
    gender: 'female',
    imageUrl: avatarUrl('avatar-17.png'),
  },
  {
    id: 'avatar-18',
    name: 'Sophia',
    description: 'Long Curly',
    gender: 'female',
    imageUrl: avatarUrl('avatar-18.png'),
  },
  {
    id: 'avatar-19',
    name: 'Lily',
    description: 'Blue Hair',
    gender: 'female',
    imageUrl: avatarUrl('avatar-19.png'),
  },
  {
    id: 'avatar-20',
    name: 'Zara',
    description: 'Short Wavy',
    gender: 'female',
    imageUrl: avatarUrl('avatar-20.png'),
  },
]

export const DEFAULT_AVATAR = AVATARS[0]

export function getAvatarById(id: string): Avatar {
  return AVATARS.find((avatar) => avatar.id === id) || DEFAULT_AVATAR
}

export function getAvatarsByGender(gender: 'male' | 'female'): Avatar[] {
  return AVATARS.filter((avatar) => avatar.gender === gender)
}
