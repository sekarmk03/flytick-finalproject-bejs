const {
    Country
} = require('../models');
const {Op} = require('sequelize')

module.exports = {
    create: async (req, res, next) => {
        try {
            const { code, name } = req.body;

            const existCode = await Country.findOne({
                where: {
                    code: code,
                }
            });

            const existName = await Country.findOne({
                where: {
                    name: name
                }
            });

            if(existCode){
                return res.status(400).json({
                status: false,
                message: 'code already used',
                data: existCode
            })}

            if(existName){
                return res.status(400).json({
                status: false,
                message: 'name already used',
                data: existName
            })}

            const country = await Country.create({
                code: code,
                name: name
            })

            return res.status(201).json({
                status: true,
                message: 'country created',
                data: country
            });

        } catch (err) {
            next(err);
        }
    },
    index: async (req, res, next) => {
        try {
            let {sort="code", type="ASC", searchC="", searchN=""} = req.query;
            const countries = await Country.findAll({order:[[sort,type]],
                where: {
                    code: {
                        [Op.iLike]: `%${searchC}%`
                    }
                }});

            if (!countries) {
                return res.status(400).json({
                    status: false,
                    message: 'country not found',
                    data: null
                });
            }

            return res.status(200).json({
                status: true,
                message: 'get all countries success',
                data: countries
            });

        } catch (err) {
            next(err);
        }
    },
    show: async (req, res, next) => {
        try {
            const { countryId } = req.params;

            const country = await Country.findOne({ where: { id: countryId } });
            if(!country) {
                return res.status(400).json({
                    status: false,
                    message: 'country not found',
                    data: null
                });
            };

            return res.status(200).json({
                status: true,
                message: 'get detail of country success',
                data: country
            });
        } catch (err) {
            next(err);
        }
    },
    update: async (req, res, next) => {
        try {
            const {
                countryId
            } = req.params;

            let {
                code,
                name
            } = req.body;

            const country = await Country.findOne({
                where: {
                    id: countryId
                }
            });

            if(!country) {
                return res.status(400).json({
                    status: false,
                    message: 'country not found',
                    data: null
                });
            };

            const existCode = await Country.findOne({
                where: {
                    code: code,
                }
            });

            const existName = await Country.findOne({
                where: {
                    name: name
                }
            });

            if(existCode){
                return res.status(400).json({
                status: false,
                message: 'code already used',
                data: existCode
            })}

            if(existName){
                return res.status(400).json({
                status: false,
                message: 'name already used',
                data: existName
            })}

            if(!code) code = country.code;
            if(!name) name = country.name;

            const updated = await country.update({
                code: code,
                name: name
            });

            return res.status(200).json({
                status: true,
                message: 'update success',
                data: updated
            });
        } catch (err) {
            next(err);
        }
    },
    delete: async (req, res, next) => {
        try {
            const {countryId} = req.params;

            const country = await Country.findOne({where: {id: countryId}});
            if(!country) {
                return res.status(400).json({
                    status: false,
                    message: 'country not found',
                    data: null
                });
            }

            const deleted = await Country.destroy({where: {id: countryId}});
            
            return res.status(201).json({
                status: true,
                message: 'delete country success',
                data: deleted
            });
        } catch (err) {
            next(err);
        }
    },
}