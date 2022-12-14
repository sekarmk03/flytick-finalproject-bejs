const {
    Biodata,
    User
} = require('../models');
const { Op } = require('sequelize')
const schema = require('../schema')
const validator = require('fastest-validator')
const v = new validator

module.exports = {
    // daftar semua penumpang
    index: async (req, res, next) => {
        try {
            let {
                sort = "name", type = "ASC", search = "", page = "1", limit = "10"
            } = req.query;
            page = parseInt(page);
            limit = parseInt(limit)
            let start = 0 + (page - 1) * limit;
            let end = page * limit;
            const biodata = await Biodata.findAndCountAll({
                order: [
                    [sort, type]
                ],
                where: {
                    name: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                limit: limit,
                offset: start
            });
            let count = biodata.count;
            let pagination ={}
            pagination.totalRows = count;
            pagination.totalPages = Math.ceil(count/limit);
            pagination.thisPageRows = biodata.rows.length;
            if (end<count){
                pagination.next = {
                    page: page + 1
                }
            }
            if (start>0){
                pagination.prev = {
                    page: page - 1
                }
            }
            
            return res.status(200).json({
                status: true,
                message: 'get all biodata success',
                pagination,
                data: biodata.rows
            })
        } catch (err) {
            next(err)
        }
    },

    // kalau user mau liat profile nya
    show: async (req, res, next) => {
        try {
            const {param_id} = req.params;
            const userData = await User.findOne({where: {id: req.user.id}});
            const id = userData.biodata_id;
            const biodata = await Biodata.findOne({
                where: {
                    id: id
                }
            });
            if (!biodata) {
                return res.status(400).json({
                    status: false,
                    message: 'biodata not found',
                    data: null
                });
            }
            return res.status(200).json({
                status: true,
                message: 'get biodata success',
                data: biodata.get()
            });
        } catch (err) {
            next(err)
        }
    },

    // if user buy ticket for other people
    create: async (req, res, next) => {
        try {
            const {
                email = null, name, nik, birth_place = null, birth_date = null, telp, nationality = 1, no_passport = null, issue_date = null, expire_date = null
            } = req.body;

            const body = req.body
            req.body.nationality = parseInt(nationality);

            const validate = v.validate(body, schema.biodata.createBiodata)

            if (validate.length) {
                return res.status(409).json(validate)
            }

            if (email) {
                const exist = await Biodata.findOne({
                    where: {
                        email: email
                    }
                });
                if (exist) {
                    return exist;
                }
            }

            const newBiodata = await Biodata.create({
                email: email,
                name: name,
                nik: nik,
                birth_place: birth_place,
                birth_date: birth_date,
                telp: telp,
                nationality: nationality,
                no_passport: no_passport,
                issue_date: issue_date,
                expire_date: expire_date
            });

            return newBiodata;
        } catch (err) {
            next(err)
        }
    },

    // update data penumpang via ticket
    update: async (req, res, next) => {
        try {
            // const {id} = req.params;
            let {
                email = null,
                name = null,
                nik = null,
                birth_place = null,
                birth_date = null,
                telp = null,
                nationality = null,
                no_passport = null,
                issue_date = null,
                expire_date = null
            } = req.body;

            const body = req.body
            if(nationality) req.body.nationality = parseInt(nationality);

            const validate = v.validate(body, schema.biodata.createBiodata)

            if (validate.length) {
                return res.status(409).json(validate)
            }

            const userData = await User.findOne({
                where: {
                    email: email
                }
            });
            const biodata = await Biodata.findOne({
                where: {
                    id: userData.biodata_id
                }
            });

            if (!biodata) {
                return null;
            }

            if (!email) email = biodata.email;
            if (!name) name = biodata.name;
            if (!nik) nik = biodata.nik;
            if (!birth_place) birth_place = biodata.birth_place;
            if (!birth_date) birth_date = biodata.birth_date;
            if (!telp) telp = biodata.telp;
            if (!nationality) nationality = biodata.nationality;
            if (!no_passport) no_passport = biodata.no_passport;
            if (!issue_date) issue_date = biodata.issue_date;
            if (!expire_date) expire_date = biodata.expire_date;

            const isUpdated = await Biodata.update({
                email: email,
                name: name,
                nik: nik,
                birth_place: birth_place,
                birth_date: birth_date,
                telp: telp,
                nationality: nationality,
                no_passport: no_passport,
                issue_date: issue_date,
                expire_date: expire_date,
            }, {
                where: {
                    id: userData.biodata_id
                }
            });

            return isUpdated;
        } catch (err) {
            next(err)
        }
    },

    // ini juga keknya ga dipake
    delete: async (req, res, next) => {
        try {
            const {
                id
            } = req.params;

            const biodata = await Biodata.findOne({
                where: {
                    id: id
                }
            });
            if (!biodata) {
                return res.status(400).json({
                    status: false,
                    message: 'biodata not found',
                    data: null
                });
            }

            const isDeleted = await Biodata.destroy({
                where: {
                    id: id
                }
            });

            return res.status(201).json({
                status: true,
                message: 'delete biodata success',
                data: isDeleted
            });
        } catch (err) {
            next(err)
        }
    }

}