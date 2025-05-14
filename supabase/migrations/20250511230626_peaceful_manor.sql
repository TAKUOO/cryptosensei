/*
  # Fix admin permissions

  1. Changes
    - Ensures admin privileges are correctly set for specified user
    - Adds error handling for non-existent users

  2. Security
    - Only affects specific user
    - Maintains existing RLS policies
*/

DO $$
BEGIN
  -- First, ensure the user exists in auth.users
  IF EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = 'matsui@rubydesign.jp'
  ) THEN
    -- Update the admin status
    UPDATE profiles
    SET is_admin = true
    WHERE id IN (
      SELECT id
      FROM auth.users
      WHERE email = 'matsui@rubydesign.jp'
    );
  END IF;
END $$;