import SupportCircle from '../models/SupportCircle.js';

/**
 * Close expired support circles based on their duration
 * This should be run periodically (e.g., every minute via cron)
 */
const closeExpiredRooms = async () => {
  try {
    const now = new Date();
    
    // Find all active circles
    const activeCircles = await SupportCircle.find({
      status: 'active',
      startedAt: { $exists: true }
    });

    let closedCount = 0;

    for (const circle of activeCircles) {
      // Calculate elapsed time in minutes
      const elapsedMinutes = (now - circle.startedAt) / (1000 * 60);
      
      // If elapsed time exceeds duration, close the circle
      if (elapsedMinutes >= circle.duration) {
        circle.status = 'ended';
        circle.endedAt = now;
        await circle.save();
        closedCount++;
        
        console.log(`Auto-closed support circle: ${circle.topic} (ID: ${circle._id}) after ${elapsedMinutes.toFixed(1)} minutes`);
      }
    }

    if (closedCount > 0) {
      console.log(`Closed ${closedCount} expired support circle(s)`);
    }

    return { closedCount };
  } catch (error) {
    console.error('Error closing expired rooms:', error);
    throw error;
  }
};

export default closeExpiredRooms;

