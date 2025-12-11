import db from "../lib/mockDb.js";
import { isEmailPhone } from "../lib/typeDetector.js";

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

    const user = db.users.find(u => u[field] === phoneorEmail);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // In a real app we would check password here. 
    // For now we just return the user as per previous logic.
    if(user.isBlocked) {
        return res.status(403).json({ error: "Account is blocked" });
    }

    return res.status(200).json({ success: true, data: user });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const RegisterController = async (req, res) => {
  try {
    const { fullName, email, phone, referralCode } = req.body;

    // Validate required fields
    if (!fullName || (!email && !phone)) {
      return res.status(400).json({
        error: "Full name and either email or phone are required",
      });
    }

    // Check if user already exists
    const existingUser = db.users.find(u => u.email === email || u.phone === phone);

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists", exists: true });
    }

    const newId = `u${db.users.length + 1}`;
    const myReferralCode = fullName.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

    const newUser = {
      id: newId,
      email: email || null,
      phone: phone || null,
      name: fullName,
      role: 'user',
      referralCode: myReferralCode,
      referredBy: referralCode,
      joinedAt: new Date().toISOString(),
      isBlocked: false,
      kycStatus: 'none'
    };

    db.users.push(newUser);
    
    // Create empty wallet
    db.wallets.push({ userId: newId, balanceINR: 0, totalProfit: 0, totalPartnershipBonus: 0 });

    return res.status(200).json({
      success: true,
      data: newUser,
      message: "User registered successfully",
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const SubmitKYCController = async (req, res) => {
    try {
        const { userId, kycUrl } = req.body;
        const user = db.users.find(u => u.id === userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.kycData = kycUrl;
        user.kycStatus = 'pending';
        
        return res.status(200).json({ success: true, user });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
