UPDATE profiles
SET is_admin = true
WHERE id IN (
  SELECT id
  FROM auth.users
  WHERE email = 'matsui@rubydesign.jp'
);