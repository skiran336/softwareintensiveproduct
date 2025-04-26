import { supabase } from './supabaseClient'; // Add this import

export const toggleFavorite = async (productId) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    alert('Please login to save favorites!');
    return { error: 'Unauthorized' };
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select()
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  if (existing) {
    // Remove favorite
    return supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);
  }

  // Add favorite
  return supabase
    .from('favorites')
    .insert({ 
      user_id: user.id,
      product_id: productId 
    });
};