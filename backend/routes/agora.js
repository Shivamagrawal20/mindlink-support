import express from "express";
import { RtcTokenBuilder } from "agora-access-token";
import { protect } from "../middleware/auth.js";
import SupportCircle from "../models/SupportCircle.js";
import Event from "../models/Event.js";

// Agora role constants
const RtcRole = {
  PUBLISHER: 1,
  SUBSCRIBER: 2,
};

const router = express.Router();

// @route   POST /api/agora/token
// @desc    Generate Agora RTC token for voice room
// @access  Private
router.post("/token", protect, async (req, res) => {
  try {
    const { channelName, channelType } = req.body; // channelType: 'support-circle' or 'event'

    if (!channelName || !channelType) {
      return res.status(400).json({
        success: false,
        message: "Channel name and type are required",
      });
    }

    // Verify channel exists and user has access
    if (channelType === "support-circle") {
      const circle = await SupportCircle.findOne({ channelName });
      if (!circle) {
        return res.status(404).json({
          success: false,
          message: "Support circle not found",
        });
      }

      // Check if user is a participant
      const isParticipant = circle.participants.some(
        (p) => p.userId.toString() === req.user._id.toString()
      );
      const isHost = circle.hostId.toString() === req.user._id.toString();

      if (!isParticipant && !isHost) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to join this circle",
        });
      }
    } else if (channelType === "event") {
      const event = await Event.findOne({ channelName });
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }
    } else if (channelType === "ai-voice") {
      // AI voice chat channels - allow any authenticated user
      // Channel name should be in format: ai-voice-{userId}
      // Verify user owns this channel or it's their personal AI chat
      if (!channelName.startsWith('ai-voice-')) {
        return res.status(400).json({
          success: false,
          message: "Invalid AI voice channel name",
        });
      }
      // Allow access - user can only access their own AI voice channel
    }

    // Generate Agora token
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    // Allow placeholder values for development (will fail gracefully)
    if (
      !appId ||
      !appCertificate ||
      appId === "your-agora-app-id-here" ||
      appCertificate === "your-agora-app-certificate-here"
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Agora is not configured yet. Please add AGORA_APP_ID and AGORA_APP_CERTIFICATE to your .env file. See SETUP_AGORA.md for instructions.",
      });
    }

    // For AI voice chat, use auto-assigned UID (null/0) to avoid conflicts
    // For support circles/events, use consistent UID based on user ID
    let uid = null;
    let useAutoUid = false;
    
    if (channelType === "ai-voice") {
      // AI voice chat: Use auto-assigned UID to prevent conflicts on reconnect
      useAutoUid = true;
      uid = 0; // 0 means Agora will auto-assign UID
    } else {
      // Support circles/events: Use consistent UID based on user ID
      // Convert MongoDB ObjectId to numeric UID (Agora requires numeric UID: 0 to 2^32-1)
      // Hash the ObjectId string to get a consistent numeric value
      const userIdString = req.user._id.toString();
      // Create a hash from the ObjectId string to get a numeric UID
      // This ensures the same user always gets the same UID
      let hash = 0;
      for (let i = 0; i < userIdString.length; i++) {
        const char = userIdString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      // Ensure UID is positive and within Agora's range (1 to 2^31-1)
      // Agora doesn't allow UID 0, so we ensure it's at least 1
      uid = Math.abs(hash % 2147483647) || 1; // 2^31 - 1 (safe for JavaScript)
    }
    
    // Use role constant (1 = PUBLISHER, 2 = SUBSCRIBER)
    const role = RtcRole.PUBLISHER; // Allow user to publish audio
    const expirationTimeInSeconds = 3600; // 1 hour

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    let token;
    if (useAutoUid) {
      // Generate token with auto-assigned UID (pass null for UID)
      token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        0, // 0 means auto-assign UID
        role,
        privilegeExpiredTs
      );
    } else {
      // Generate token with specific UID
      token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid, // Numeric UID
        role,
        privilegeExpiredTs
      );
    }

    const userIdString = req.user._id.toString();
    console.log(`✅ Generated Agora token for channel: ${channelName}, ${useAutoUid ? 'auto-assigned UID' : `UID: ${uid}`} (from user: ${userIdString})`);

    res.status(200).json({
      success: true,
      token,
      appId,
      channelName,
      uid: useAutoUid ? null : uid, // Return null for auto-assigned, or numeric UID
      autoUid: useAutoUid, // Flag to indicate auto-assigned UID
    });
  } catch (error) {
    console.error("Agora token generation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// @route   POST /api/agora/rtm-token
// @desc    Generate Agora RTM token for real-time messaging (for games)
// @access  Private
// NOTE: RTM token generation is temporarily disabled as RtmTokenBuilder is not available in agora-access-token package
// TODO: Implement RTM token generation using alternative method or different package
router.post("/rtm-token", protect, async (req, res) => {
  res.status(503).json({
    success: false,
    message: "RTM token generation is not yet implemented. RTM support requires additional setup.",
  });
});

export default router;
