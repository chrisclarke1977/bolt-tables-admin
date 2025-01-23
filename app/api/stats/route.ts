import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [
      { count: usersCount },
      { count: productsCount },
      { count: postsCount },
      { count: commentsCount },
      { count: reactionsCount },
      { count: categoriesCount },
      { count: ordersCount },
      { count: appointmentsCount },
      { count: locationsCount },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('reactions').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }),
      supabase.from('locations').select('*', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      users: usersCount || 0,
      products: productsCount || 0,
      posts: postsCount || 0,
      comments: commentsCount || 0,
      reactions: reactionsCount || 0,
      categories: categoriesCount || 0,
      orders: ordersCount || 0,
      appointments: appointmentsCount || 0,
      locations: locationsCount || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}