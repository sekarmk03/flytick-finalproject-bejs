module.exports = {
    createNotif: {
        user_id: 'number',
        topic: 'string',
        message: 'string',
        is_read: {type: 'boolean', optional: true}
    }
}