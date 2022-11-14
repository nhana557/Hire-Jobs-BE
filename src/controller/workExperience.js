const commonHelper = require("../helper/common");
const { experienceModel } = require("../models/experience");
const createError = require("http-errors");
const deleteGoogleDrive = require("../utils/deleteGoogleDrive");
const uploadGoogleDrive = require("../utils/uploadGoogleDrive");
const deleteFile = require('../utils/delete')

exports.experienceController = {
  selecAllExperience: async (req, res, next) => {
    experienceModel
      .getAll()
      .then((result) => {
        commonHelper.response(res, result, "get All Experience succes", 200);
      })
      .catch((err) => console.log(err));
  },
  createExperience: async (req, res, next) => {
    try {
      const { position, name_company, month_year, job_description } = req.body;
      const id_worker = req.decoded.id;
      const {
        rows: [count],
      } = await experienceModel.countData();
      console.log(count.total);
      const id = Number(count.total) + 1;
      console.log(id_worker);

      let image = req.files.image;
      console.log(image);
      if (req.files) {
        if (req.files.image) {
          // menghapus image sebelumnya di gd jika sebelumnya sudah pernah upload
          console.log(req.files.image);
          if (image) {
            await deleteGoogleDrive(image);
          }
          // upload photo baru ke gd
          console.log("ini image", req.files.image[0].path);
          image = await uploadGoogleDrive(req.files.image[0]);
          // menghapus image setelah diupload ke gd
          deleteFile(req.files.image[0].path);
        }
      }
      console.log(image)
      const data = {
        position,
        name_company,
        month_year,
        job_description,
        id,
        image: image ? image.id : null,
        id_worker,
      };
      experienceModel.create(data);
      commonHelper.response(res, data, "Add experience", 201);
    } catch (error) {
      console.log(error);
    }
  },
  updateExperience: async (req, res, next) => {
    try {
      const id = req.params.id;
      console.log(id);
      const { position, name_company, month_year, job_description } = req.body;
      const id_worker = req.decoded.id;

      let image = req.files.image;
      console.log(image);
      if (req.files) {
        if (req.files.image) {
          // menghapus image sebelumnya di gd jika sebelumnya sudah pernah upload
          console.log(req.files.image);
          if (image) {
            await deleteGoogleDrive(image);
          }
          // upload photo baru ke gd
          console.log("ini image", req.files.image[0].path);
          image = await uploadGoogleDrive(req.files.image[0]);
          // menghapus image setelah diupload ke gd
          deleteFile(req.files.image[0].path);
        }
      }
      console.log(image)

      const data = {
        position,
        name_company,
        month_year,
        image: image ? image.id : null,
        job_description,
        id_worker,
      };
      experienceModel.update(data, id);
      commonHelper.response(res, data, "updated experience", 200);
    } catch (error) {
      console.log(error);
    }
  },
  deleteExperience: async (req, res, next) => {
    try {
      const id = req.params.id;
      experienceModel.deleteExperience(id);
      commonHelper.response(res, id, "Delete data success", 200);
    } catch (error) {}
  },
  getExperienceBy: (req, res, next) => {
    const id = req.params.id;
    experienceModel
      .getByID(id)
      .then((result) => {
        commonHelper.response(res, result, "get data Experience", 200);
      })
      .catch((error) => {
        console.log(error);
        next(createError);
      });
  },
  searchExperience: async (req, res, next) => {
    try {
      const sortby = req.query.sortby || "name_company";
      const search = req.query.search || "";
      const result = await experienceModel.search({ sortby, search });

      commonHelper.response(res, result, "get data success", 200);
    } catch (error) {
      console.log(error);
    }
  },
};
