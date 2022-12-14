const {
    Flight
} = require('../models');

const {
    Op
} = require('sequelize')

module.exports = {
    create: async (req, res, next) => {
        try {
            const {
                code,
                capacity,
                fclass,
                current_airport,
                is_ready = true,
                is_maintain = false
            } = req.body;

            const exist = await Flight.findOne({
                where: {
                    code: code
                }
            });
            if (exist) {
                return res.status(409).json({
                    status: false,
                    message: 'flight already exist',
                    data: null
                });
            }

            const flight = await Flight.create({
                code: code,
                capacity: capacity,
                fclass: fclass,
                current_airport: current_airport,
                is_ready: is_ready,
                is_maintain: is_maintain
            })

            return res.status(201).json({
                status: true,
                message: 'flight created',
                data: flight
            });

        } catch (err) {
            next(err)
        }
    },
    index: async (req, res, next) => {
        try {
            let {
                sort = "code", type = "ASC", search = "", page = "0", limit = "10"
            } = req.query;
            page = parseInt(page);
            limit = parseInt(limit)
            let start = 0 + (page - 1) * limit;
            let end = page * limit;
            if(page == 0) {
                limit = await Flight.count();
                start = 0;
                end = 1 * limit;
            }
            const allFlight = await Flight.findAndCountAll({
                where: {
                    code: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                order: [
                    ['is_ready', 'desc'],
                    [sort, type]
                ],
                limit: limit,
                offset: start
            });
            let count = allFlight.count;
            let pagination ={}
            pagination.totalRows = count;
            pagination.totalPages = Math.ceil(count/limit);
            pagination.thisPageRows = allFlight.rows.length;
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
                message: 'get all flight success',
                pagination,
                data: allFlight.rows
            });

        } catch (err) {
            next(err)
        }
    },
    show: async (req, res, next) => {
        try {
            const {
                id
            } = req.params;

            const flight = await Flight.findOne({
                where: {
                    id: id
                }
            });

            if (!flight) {
                return res.status(400).json({
                    status: false,
                    message: 'flight not found',
                    data: null
                });
            };

            return res.status(200).json({
                status: true,
                message: 'get detail of flight success',
                data: flight
            });
        } catch (err) {
            next(err)
        }
    },
    update: async (req, res, next) => {
        try {
            const {
                id
            } = req.params;

            let {
                code,
                capacity,
                fClass,
                current_airport,
                is_ready,
                is_maintain
            } = req.body;

            let flight = await Flight.findOne({
                where: {
                    id: id
                }
            });

            if (!flight) {
                return res.status(400).json({
                    status: false,
                    message: 'flight not found',
                    data: null
                });
            };

            if (!code) code = flight.code;
            if (!capacity) capacity = flight.capacity;
            if (!fClass) fClass = flight.fClass;
            if (!current_airport) current_airport = flight.current_airport;
            if (!is_ready) is_ready = flight.is_ready;
            if (!is_maintain) is_maintain = flight.is_maintain;

            if (is_maintain == true) is_ready = false;

            const updated = await flight.update({
                code: code,
                capacity: capacity,
                fClass: fClass,
                current_airport: current_airport,
                is_ready: is_ready,
                is_maintain: is_maintain
            }, {
                where: {
                    id: id
                }
            });

            return res.status(200).json({
                status: true,
                message: 'update flight success',
                data: updated
            });
        } catch (err) {
            next(err)
        }
    },
    delete: async (req, res, next) => {
        try {
            const {
                id
            } = req.params;

            const flight = await Flight.findOne({
                where: {
                    id: id
                }
            });
            if (!flight) {
                return res.status(400).json({
                    status: false,
                    message: 'flight not found',
                    data: null
                });
            }

            const deleted = await Flight.destroy({
                where: {
                    id: id
                }
            });

            return res.status(201).json({
                status: true,
                message: 'delete flight success',
                data: deleted
            });
        } catch (err) {
            next(err)
        }
    },
}