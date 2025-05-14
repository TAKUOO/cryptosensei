/*
  # Grant admin access to specific user

  1. Changes
    - Set is_admin to true for specified user
  2. Security
    - No changes to RLS policies
*/

UPDATE profiles
SET is_admin = true
WHERE id IN (
  SELECT id
  FROM auth.users
  WHERE email = 'matsui@rubydesign.jp'
);