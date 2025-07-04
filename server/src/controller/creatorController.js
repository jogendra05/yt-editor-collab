import express from "express";
import { Video, Project } from "../models/schema.js";


export const creatorRouter = async (req, res) => {
    try {
      const { project_id } = req.body;

      if (!project_id || !req.file) {
        return res.status(400).json({ error: "Project ID and video file are required" });
      }

      const project = await Project.findOne({ _id: project_id, creator_id: req.userId });
      if (!project) {
        return res.status(403).json({ error: "Unauthorized: not your project" });
      }

      const video = await Video.create({
        project_id,
        uploaded_by: req.userId,
        s3_key: req.file.path,
        status: "pending"
      });

      res.status(201).json({ message: "Video uploaded successfully", video });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Video upload failed" });
    }
  }
export default router;
