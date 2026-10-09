import { Request, Response } from 'express';
import { Attendance } from '../models/Attendance.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, batchId, startDate, endDate } = req.query;
    const query: any = {};

    if (studentId) query.student = studentId;
    if (batchId) query.batch = batchId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const records = await Attendance.find(query)
      .populate('student', 'name email avatar')
      .populate('batch', 'name code')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const records = await Attendance.find({ student: req.user._id }).sort({ date: -1 });
    const totalDays = records.length;
    const presentCount = records.filter((r) => r.status === 'Present').length;
    const lateCount = records.filter((r) => r.status === 'Late').length;
    const absentCount = records.filter((r) => r.status === 'Absent').length;
    const percentage = totalDays > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalDays) * 100) : 100;

    // Check today's attendance status
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayRecord = await Attendance.findOne({
      student: req.user._id,
      date: { $gte: startOfToday, $lte: endOfToday },
    });

    res.status(200).json({
      success: true,
      data: {
        records,
        totalDays,
        presentCount,
        lateCount,
        absentCount,
        percentage,
        todayStatus: todayRecord ? todayRecord.status : 'Pending',
        todayCheckInTime: todayRecord?.checkInTime,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, batchId, date, status, remarks, checkInTime } = req.body;
    const targetStudent = studentId || req.user?._id;
    const attendanceDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    let record = await Attendance.findOne({
      student: targetStudent,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (record) {
      record.status = status || 'Present';
      record.remarks = remarks || record.remarks;
      if (checkInTime) record.checkInTime = checkInTime;
      await record.save();
    } else {
      record = await Attendance.create({
        student: targetStudent,
        batch: batchId,
        date: attendanceDate,
        status: status || 'Present',
        markedBy: req.user?._id,
        remarks: remarks || '',
        checkInTime: checkInTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    await logAuditEvent(req, 'MARK_ATTENDANCE', 'ATTENDANCE', record._id.toString(), {
      studentId: targetStudent,
      status: record.status,
    });

    res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markBatchAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { batchId, date, entries } = req.body; // entries: [{ studentId, status, remarks }]
    const attendanceDate = date ? new Date(date) : new Date();

    const results = [];
    for (const entry of entries) {
      const startOfDay = new Date(attendanceDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(attendanceDate);
      endOfDay.setHours(23, 59, 59, 999);

      let record = await Attendance.findOne({
        student: entry.studentId,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      if (record) {
        record.status = entry.status;
        record.remarks = entry.remarks || record.remarks;
        await record.save();
        results.push(record);
      } else {
        const created = await Attendance.create({
          student: entry.studentId,
          batch: batchId,
          date: attendanceDate,
          status: entry.status,
          markedBy: req.user?._id,
          remarks: entry.remarks || '',
        });
        results.push(created);
      }
    }

    await logAuditEvent(req, 'MARK_BATCH_ATTENDANCE', 'ATTENDANCE', batchId, {
      count: entries.length,
    });

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
