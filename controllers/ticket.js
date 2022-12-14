const { Ticket, Flight, Schedule, Transaction, User, Biodata, Airport, Country, City, sequelize } = require('../models');
const { Op, QueryTypes } = require('sequelize');
const generate_qr = require('../utils/generate_qr');
const generatePDF = require('../utils/generatePDF');
const { FE_BASE_URL = 'https://flytick.km3ggwp.com' } = process.env;
const mail = require('../utils/mailer')

const index = async (req, res, next) => {
    try {
        let { sort = "createdAt", type = "DESC", search = "", page = "1", limit = "10", checked_in = null } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        let start = 0 + (page - 1) * limit;
        let end = page * limit;
        let tickets;
        let countTickets;
        let querySelect = `SELECT * FROM "Tickets" WHERE user_id IN (SELECT id FROM "Users" WHERE name ILIKE '%${search}%') OR biodata_id IN (SELECT id FROM "Biodata" WHERE name LIKE '%${search}%')`;
        let queryOrder = `ORDER BY "${sort}" ${type} LIMIT ${limit} OFFSET ${start}`;
        // let querySeqSelect = await Ticket.findAll({
        //     include: { model: Schedule, as: 'schedule', include: [
        //         {model: Flight, as: 'flight'},
        //         {model: Airport, as: 'fromAirport'},
        //         {model: Airport, as: 'toAirport'}
        //     ] }
        // })
        if (checked_in !== null) {
            querySelect = `${querySelect} AND checked_in=${checked_in}`;
        }
        if (req.user.role == 'admin' || req.user.role == 'superadmin') {
            tickets = await sequelize.query(`${querySelect} ${queryOrder}`, {
                type: QueryTypes.SELECT
            });

            countTickets = await sequelize.query(`${querySelect}`, {
                type: QueryTypes.SELECT
            });
        } else if (req.user.role == 'user') {
            tickets = await sequelize.query(`${querySelect} AND user_id=${req.user.id} ${queryOrder}`, {
                type: QueryTypes.SELECT
            });

            countTickets = await sequelize.query(`${querySelect} AND user_id=${req.user.id}`, {
                type: QueryTypes.SELECT
            });
        }

        let count = countTickets.length;
        let thisPageRows = tickets.length;
        let pagination = {};
        pagination.totalRows = count;
        pagination.totalPages = Math.ceil(count / limit);
        pagination.thisPageRows = thisPageRows;
        if (end < count) {
            pagination.next = {
                page: page + 1
            };
        }
        if (start > 0) {
            pagination.prev = {
                page: page - 1
            };
        }

        return res.status(200).json({
            status: true,
            message: 'get all tickets success',
            data: tickets
        })
    } catch (err) {
        next(err);
    }
};

const show = async (req, res, next) => {
    try {
        let ticketId;
        if (!req.params.id) {
            ticketId = req.body.ticket_id;
        } else {
            const { id } = req.params;
            ticketId = id;
        }
        const ticket = await Ticket.findOne({ where: { id: ticketId } });
        if (!ticket) {
            return res.status(400).json({
                status: false,
                message: 'ticket not found',
                data: null
            });
        }
        const userData = await User.findOne({ where: { id: ticket.user_id } });
        const transactionData = await Transaction.findOne({ where: { id: ticket.transaction_id } });
        const passengerData = await Biodata.findOne({ where: { id: ticket.biodata_id } });
        const scheduleData = await Schedule.findOne({ where: { id: ticket.schedule_id } });
        const fromAirportData = await Airport.findOne({ where: { id: scheduleData.from_airport } });
        const toAirportData = await Airport.findOne({ where: { id: scheduleData.to_airport } });
        const flightData = await Flight.findOne({ where: { id: ticket.flight_id } });
        const data = {
            ticketData: ticket.get(),
            userData: {
                name: userData.name,
                email: userData.email,
                balance: userData.balance
            },
            transactionData: {
                transaction_time: transactionData.transaction_time,
                invoice_number: transactionData.invoice_number,
                paid_time: transactionData.paid_time,
                paid_status: transactionData.paid_status
            },
            passengerData: {
                email: passengerData.email,
                name: passengerData.name,
                nik: passengerData.nik,
                birth_place: passengerData.birth_place,
                birth_date: passengerData.birth_date,
                telp: passengerData.telp,
                nationality: await Country.findOne({ where: { id: passengerData.nationality } }).name,
                no_passport: passengerData.no_passport,
                issue_date: passengerData.issue_date,
                expire_date: passengerData.expire_date,
            },
            scheduleData: {
                cost: scheduleData.cost,
                departure_time: scheduleData.departure_time,
                arrival_time: scheduleData.arrival_time,
            },
            fromAirportData: {
                code: fromAirportData.code,
                name: fromAirportData.name,
                city: await City.findOne({ where: { id: fromAirportData.city_id } }).name,
                country: await Country.findOne({ where: { id: fromAirportData.country_id } }).name,
                maps_link: fromAirportData.maps_link,
            },
            toAirportData: {
                code: toAirportData.code,
                name: toAirportData.name,
                city: await City.findOne({ where: { id: toAirportData.city_id } }).name,
                country: await Country.findOne({ where: { id: toAirportData.country_id } }).name,
                maps_link: toAirportData.maps_link,
            },
            flightData: {
                code: flightData.code,
                class: flightData.fClass
            }
        };

        if (!req.params.id) {
            return data;
        } else {
            return res.status(200).json({
                status: true,
                message: 'get ticket success',
                data: data
            });
        }
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        let { type, ticket_schedule_id, user_id, biodata_id, transaction_id, flight_id, qr_code = null } = req.body;

        // initialize ticket number
        let ticket_number = '';

        // generate pdf
        let ticket_pdf = '';
        // send pdf in transaction

        // generate seat
        const flightData = await Flight.findOne({ where: { id: flight_id } });
        if (!flightData) {
            return res.status(404).json({
                status: false,
                message: 'flightData data not found',
                data: null
            })
        }

        let fClass = flightData.fClass[0];
        const scheduleData = await Schedule.findOne({ where: { id: ticket_schedule_id } });
        if (!scheduleData) {
            return res.status(404).json({
                status: false,
                message: 'scheduleData data not found',
                data: null
            })
        }

        const seat_number = `${fClass}/${String(scheduleData.passenger + 1).padStart(3, '0')}`;

        const newTicket = await Ticket.create({
            ticket_number,
            type,
            seat_number,
            schedule_id: ticket_schedule_id,
            user_id,
            biodata_id,
            transaction_id,
            flight_id,
            checked_in: false,
            qr_code,
            ticket_pdf
        });

        // generate ticket number
        const transactionData = await Transaction.findOne({ where: { id: transaction_id } });
        if (!transactionData) {
            return res.status(404).json({
                status: false,
                message: 'transactionData data not found',
                data: null
            })
        }

        ticket_number = `${newTicket.id}/${type[0]}/${flightData.code}/${transactionData.invoice_number}`;

        // generate qr
        qr_code = await generate_qr(`${FE_BASE_URL}/admin/verification/${newTicket.id}`);

        // update qr_code ticket
        await Ticket.update({
            ticket_number: ticket_number,
            qr_code: qr_code.url
        }, {
            where: {
                id: newTicket.id
            }
        });

        // Generate PDF
        req.body.ticket_id = newTicket.id;
        const dataToGenerate = await show(req, res, next);
        const pdf = await generatePDF(dataToGenerate);
        ticket_pdf = pdf.url;

        // update pdf ticket
        await Ticket.update({
            ticket_pdf: ticket_pdf
        }, {
            where: {
                id: newTicket.id
            }
        });

        return newTicket;
    } catch (err) {
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        let { type, ticket_schedule_id, user_id, biodata_id, transaction_id, qr_code = null } = req.body;

        const ticket = await Ticket.findOne({ where: { id: id } });
        if (!ticket) {
            return res.status(400).json({
                status: false,
                message: 'ticket not found',
                data: null
            });
        }

        if (!type) type = ticket.type;
        if (!ticket_schedule_id) ticket_schedule_id = ticket.ticket_schedule_id;
        if (!user_id) user_id = ticket.user_id;
        if (!biodata_id) biodata_id = ticket.biodata_id;
        if (!transaction_id) transaction_id = ticket.transaction_id;
        if (!qr_code) qr_code = ticket.qr_code;

        const isUpdated = await Ticket.update({
            type,
            schedule_id: ticket_schedule_id,
            user_id,
            biodata_id,
            transaction_id,
            checked_in: true,
            qr_code
        }, {
            where: { id: id }
        });

        return res.status(200).json({
            status: true,
            message: 'update ticket success',
            data: isUpdated
        });
    } catch (err) {
        next(err);
    }
};

const update_checked_in = async (req, res, next) => {
    try {
        const { id } = req.params;

        const ticket = await Ticket.findOne({ where: { id: id } });
        if (!ticket) {
            return res.status(400).json({
                status: false,
                message: 'ticket not found',
                data: null
            });
        }

        // if(ticket.checked_in === true) {
        //     return res.status(400).json({
        //         status: false,
        //         message: 'ticket already used',
        //         data: null
        //     });
        // }

        const isUpdated = await Ticket.update({
            checked_in: true
        }, {
            where: { id: id }
        });

        const userData = await User.findOne({ where: { id: ticket.user_id } })

        // kirim email berhasil check in
        const htmlEmail = await mail.getHtml('enjoyYourTrip.ejs', { name: userData.name })

        const sendEmail = await mail.sendMail(userData.email, 'Enjoy Your Trip!', htmlEmail)

        return res.status(200).json({
            status: true,
            message: 'check in success',
            data: isUpdated
        });
    } catch (err) {
        next(err);
    }
};

const deleteTicket = async (req, res, next) => {
    try {
        const { id } = req.params;

        const ticket = await Ticket.findOne({ where: { id: id } });
        if (!ticket) {
            return res.status(400).json({
                status: false,
                message: 'ticket not found',
                data: null
            });
        }

        const isDeleted = await Ticket.destroy({
            where: { id: id }
        });

        return res.status(201).json({
            status: true,
            message: 'delete ticket success',
            data: isDeleted
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    index,
    show,
    create,
    update,
    update_checked_in,
    delete: deleteTicket
}