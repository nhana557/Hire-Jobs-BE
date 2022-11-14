const db = require('../config/db')

const modelReview = {
    getAll: () =>{
        return new Promise((resolve, reject) =>{
            db.query(`select testimon.id, testimon.opini, worker.image, worker.jobs, worker.fullname FROM testimon INNER JOIN worker ON testimon.id_worker = worker.id`, (err, result) =>{
                if(!err){
                    resolve(result.rows)
                }else{
                    reject(new Error(err))
                }
            })
        })
    },
    insert: (data) =>{
        const {id, opini, id_worker} = data
        return new Promise((resolve, reject) =>{
            db.query(`INSERT INTO testimon (id, opini, id_worker) values($1, $2, $3)`, [id, opini,  id_worker], (err, result) =>{
                if(!err){
                    resolve(result.rows)
                }else{
                    reject(new Error(err))
                }
            })
        })
    },
    countData: () =>{
        return db.query(
            'SELECT COUNT(*) AS total FROM testimon'
        )
    },

}

module.exports = { modelReview }