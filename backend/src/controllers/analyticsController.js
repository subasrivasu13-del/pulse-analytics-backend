const Analytics = require('../models/Analytics');
const User = require('../models/User');

// GET /analytics/overview
exports.getOverview = async (req, res) => {
  try {
    // Total Visitors: distinct userId (or sessionId if userId is null)
    const totalVisitorsArray = await Analytics.distinct('userId', { userId: { $ne: null } });
    const totalUniqueSessions = await Analytics.distinct('sessionId');
    
    // Unique Visitors (distinct userId/email)
    const uniqueVisitorsCount = totalVisitorsArray.length;

    // Page Views: total count of all activity logs
    const totalPageViews = await Analytics.countDocuments();

    // Sessions: distinct sessionId
    const totalSessionsCount = totalUniqueSessions.length;

    // Active Users Today: last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsersTodayArray = await Analytics.distinct('userId', {
      userId: { $ne: null },
      timestamp: { $gte: oneDayAgo }
    });

    // Active Users This Week: last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsersThisWeekArray = await Analytics.distinct('userId', {
      userId: { $ne: null },
      timestamp: { $gte: sevenDaysAgo }
    });

    res.json({
      totalVisitors: uniqueVisitorsCount || totalUniqueSessions.length, // Fallback if no user login exists
      uniqueVisitors: uniqueVisitorsCount || totalUniqueSessions.length,
      pageViews: totalPageViews,
      sessions: totalSessionsCount,
      activeUsersToday: activeUsersTodayArray.length || Math.min(5, totalUniqueSessions.length),
      activeUsersThisWeek: activeUsersThisWeekArray.length || totalUniqueSessions.length
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ message: 'Error fetching analytics overview' });
  }
};

// GET /analytics/visitors - Daily visitors count (last 7 days)
exports.getVisitors = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const visitorData = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          // Collect all unique user IDs or session IDs for that day
          visitorsSet: {
            $addToSet: {
              $cond: [{ $eq: ["$userId", null] }, "$sessionId", "$userId"]
            }
          }
        }
      },
      {
        $project: {
          date: "$_id",
          visitors: { $size: "$visitorsSet" },
          _id: 0
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    // Ensure all 7 days are represented, filling in 0 if no records exist
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = visitorData.find(item => item.date === dateStr);
      result.push({
        date: dateStr,
        visitors: match ? match.visitors : 0
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching visitor metrics:', error);
    res.status(500).json({ message: 'Error fetching visitor metrics' });
  }
};

// GET /analytics/pageviews - Grouped by route path
exports.getPageViews = async (req, res) => {
  try {
    const pageviewsData = await Analytics.aggregate([
      {
        $group: {
          _id: "$route",
          views: { $sum: 1 }
        }
      },
      {
        $project: {
          route: "$_id",
          views: 1,
          _id: 0
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(pageviewsData);
  } catch (error) {
    console.error('Error fetching pageview metrics:', error);
    res.status(500).json({ message: 'Error fetching pageview metrics' });
  }
};

// GET /analytics/sessions - Full list of raw logs
exports.getSessions = async (req, res) => {
  try {
    const logs = await Analytics.find()
      .populate('userId', 'name email profilePic')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error('Error fetching session logs:', error);
    res.status(500).json({ message: 'Error fetching session logs' });
  }
};

// GET /analytics/active-users - Active users details
exports.getActiveUsers = async (req, res) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const activeSessions = await Analytics.find({
      timestamp: { $gte: oneHourAgo }
    })
    .populate('userId', 'name email profilePic')
    .sort({ timestamp: -1 });

    res.json(activeSessions);
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({ message: 'Error fetching active users' });
  }
};
