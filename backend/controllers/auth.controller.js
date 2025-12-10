import { supabase } from "../lib/supabaseClient.js";
import { isEmailPhone } from "../lib/typeDetector.js";

// ------------------- LOGIN -------------------
export const LoginController = async (req, res) => {
  try {
    const { phoneorEmail } = req.body;

    if (!phoneorEmail) {
      return res.status(400).json({ error: "Email or phone required" });
    }

    const field = isEmailPhone(phoneorEmail); // returns "email" or "phone"

    if (!field) {
      return res.status(400).json({ error: "Invalid email or phone" });
    }

    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .eq(field, phoneorEmail)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ success: true, data });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};



// ------------------- REGISTER -------------------
export const RegisterController = async (req, res) => {
  try {
    const { fullName, email, phone, refcode } = req.body;

    // Validate required fields
    if (!fullName || (!email && !phone)) {
      return res.status(400).json({
        error: "Full name and either email or phone are required",
      });
    }

    // Check if user already exists by email or phone
    const { data: existingUser, error: existErr } = await supabase
      .from("Users")
      .select("*")
      .or(`email.eq.${email},phone.eq.${phone}`)
      .maybeSingle();

    if (existErr) {
      return res.status(400).json({ error: existErr.message });
    }

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists", exists: true });
    }

    // Insert new user
    const { data: user, error: insertErr } = await supabase
      .from("Users")
      .insert([
        {
          fullName,
          email: email || null,
          phone: phone || null,
          refcode: refcode || null,
        },
      ])
      .select()
      .single();

    if (insertErr) {
      return res.status(400).json({ error: insertErr.message });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: "User registered successfully",
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
