export interface ProfileErrors { name?: string; email?: string; phone?: string; website?: string; currentPassword?: string; newPassword?: string; }

export function validateProfile(name: string, email: string, phone?: string, website?: string): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!name.trim()) errors.name = 'Name is required';
  if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email';
  if (phone && !/^\+?[\d\s\-()]{6,20}$/.test(phone)) errors.phone = 'Enter a valid phone number';
  if (website && !/^https?:\/\/.+\..+/.test(website)) errors.website = 'Enter a valid URL (https://...)';
  return errors;
}

export function validatePassword(current: string, newPw: string): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!current) errors.currentPassword = 'Current password is required';
  if (!newPw || newPw.length < 6) errors.newPassword = 'Password must be at least 6 characters';
  return errors;
}
