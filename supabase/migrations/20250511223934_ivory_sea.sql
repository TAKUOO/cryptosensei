/*
  # Add trigger for new user profiles

  1. Changes
    - Add trigger function to create profile for new users
    - Add trigger to automatically create profile on user creation
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, is_admin, created_at)
  VALUES (new.id, false, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();