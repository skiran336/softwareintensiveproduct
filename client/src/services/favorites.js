import { supabase } from './supabaseClient';

export const toggleFavorite = async (productId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    return supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);
  }

  return supabase
    .from('favorites')
    .insert({ 
      user_id: user.id,
      product_id: productId 
    });
};

export const fetchUserFavorites = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', user.id);

  return data?.map(fav => fav.product_id) || [];
};