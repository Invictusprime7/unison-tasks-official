import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingPayload {
  action: 'create' | 'cancel' | 'reschedule';
  businessId: string;
  serviceId?: string;
  slotId?: string;
  bookingId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startsAt?: string;
  endsAt?: string;
  notes?: string;
  newStartsAt?: string;
  newEndsAt?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const bookingSchema = z.object({
      action: z.enum(['create', 'cancel', 'reschedule']).default('create'),
      businessId: z.string().uuid(),
      serviceId: z.string().uuid().optional(),
      slotId: z.string().uuid().optional(),
      bookingId: z.string().uuid().optional(),
      customerName: z.string().trim().min(1).max(120).default(''),
      customerEmail: z.string().trim().email().max(255).default(''),
      customerPhone: z.string().trim().max(40).optional(),
      startsAt: z.string().trim().max(64).optional(),
      endsAt: z.string().trim().max(64).optional(),
      notes: z.string().trim().max(2000).optional(),
      newStartsAt: z.string().trim().max(64).optional(),
      newEndsAt: z.string().trim().max(64).optional(),
    });

    const parsed = bookingSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = parsed.data as BookingPayload;
    const action = body.action || 'create';

    switch (action) {
      case 'create':
        return await handleCreateBooking(supabase, body);
      case 'cancel':
        return await handleCancelBooking(supabase, body);
      case 'reschedule':
        return await handleRescheduleBooking(supabase, body);
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Booking error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleCreateBooking(supabase: any, body: BookingPayload) {
  const { 
    businessId, 
    serviceId, 
    slotId,
    customerName, 
    customerEmail, 
    customerPhone,
    startsAt, 
    endsAt,
    notes 
  } = body;

  // Validate required fields
  if (!businessId || !customerName || !customerEmail) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Business ID, customer name, and email are required" 
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!startsAt) {
    return new Response(
      JSON.stringify({ success: false, error: "Start time is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // If slot ID provided, check availability
  if (slotId) {
    const { data: slot, error: slotError } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("id", slotId)
      .eq("is_booked", false)
      .single();

    if (slotError || !slot) {
      return new Response(
        JSON.stringify({ success: false, error: "Selected time slot is not available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark slot as booked
    await supabase
      .from("availability_slots")
      .update({ is_booked: true })
      .eq("id", slotId);
  }

  // Get service details if provided
  let serviceName = "Appointment";
  let duration = 60;
  
  if (serviceId) {
    const { data: service } = await supabase
      .from("services")
      .select("name, duration_minutes")
      .eq("id", serviceId)
      .single();
    
    if (service) {
      serviceName = service.name;
      duration = service.duration_minutes;
    }
  }

  // Calculate end time if not provided
  const bookingStartsAt = new Date(startsAt);
  const bookingEndsAt = endsAt 
    ? new Date(endsAt) 
    : new Date(bookingStartsAt.getTime() + duration * 60000);

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      business_id: businessId,
      service_id: serviceId || null,
      service_name: serviceName,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || null,
      booking_date: bookingStartsAt.toISOString().split('T')[0],
      booking_time: bookingStartsAt.toTimeString().split(' ')[0],
      starts_at: bookingStartsAt.toISOString(),
      ends_at: bookingEndsAt.toISOString(),
      duration_minutes: duration,
      notes: notes || null,
      status: "confirmed",
    })
    .select()
    .single();

  if (bookingError) {
    console.error("Failed to create booking:", bookingError);
    
    // Revert slot if we marked it as booked
    if (slotId) {
      await supabase
        .from("availability_slots")
        .update({ is_booked: false })
        .eq("id", slotId);
    }
    
    return new Response(
      JSON.stringify({ success: false, error: "Failed to create booking" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: { 
        id: booking.id,
        startsAt: booking.starts_at,
        endsAt: booking.ends_at,
        message: `Your ${serviceName} is confirmed for ${bookingStartsAt.toLocaleDateString()} at ${bookingStartsAt.toLocaleTimeString()}` 
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleCancelBooking(supabase: any, body: BookingPayload) {
  const { bookingId, businessId } = body;

  if (!bookingId) {
    return new Response(
      JSON.stringify({ success: false, error: "Booking ID is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get booking to find associated slot
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return new Response(
      JSON.stringify({ success: false, error: "Booking not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Update booking status
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (updateError) {
    return new Response(
      JSON.stringify({ success: false, error: "Failed to cancel booking" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Free up the slot if there was one
  if (booking.starts_at) {
    await supabase
      .from("availability_slots")
      .update({ is_booked: false })
      .eq("business_id", businessId)
      .eq("starts_at", booking.starts_at);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: { message: "Booking cancelled successfully" }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleRescheduleBooking(supabase: any, body: BookingPayload) {
  const { bookingId, newStartsAt, newEndsAt } = body;

  if (!bookingId || !newStartsAt) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Booking ID and new start time are required" 
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get current booking
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return new Response(
      JSON.stringify({ success: false, error: "Booking not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const newStart = new Date(newStartsAt);
  const duration = booking.duration_minutes || 60;
  const newEnd = newEndsAt 
    ? new Date(newEndsAt) 
    : new Date(newStart.getTime() + duration * 60000);

  // Update booking
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ 
      starts_at: newStart.toISOString(),
      ends_at: newEnd.toISOString(),
      booking_date: newStart.toISOString().split('T')[0],
      booking_time: newStart.toTimeString().split(' ')[0],
    })
    .eq("id", bookingId);

  if (updateError) {
    return new Response(
      JSON.stringify({ success: false, error: "Failed to reschedule booking" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: { 
        message: `Booking rescheduled to ${newStart.toLocaleDateString()} at ${newStart.toLocaleTimeString()}`,
        startsAt: newStart.toISOString(),
        endsAt: newEnd.toISOString()
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
