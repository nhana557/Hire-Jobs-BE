const bcrypt = require('bcrypt')
const db = require('../config/db')


const authModel = {
    findEmail: (email) =>{
        return new Promise((resolve, reject) =>{
            db.query(
                'SELECT * FROM recruiter WHERE email = $1', [email],
                (err, result) =>{
                    if(!err){
                        resolve(result)
                    }else{
                        reject(err)
                    }
                }
            )
        })
    },
    findByToken : (by, token) =>{
        return new Promise((resolve, reject) =>{
            db.query(
                `SELECT * FROM recruiter WHERE ${by}= $1`, [token], 
                (err, result) =>{
                    if(!err){
                        resolve(result)
                    }else{
                        reject(new Error(err))
                    }
                }
            )
        })
    },
    activateEmail: (id) =>{
        return new Promise((resolve, reject) =>{
            db.query(
                `UPDATE recruiter SET active=true WHERE id=$1`,[id], (err, result) =>{
                    if(!err){
                        resolve(result)
                    }else{
                        reject(new Error(err))
                    }
                }
            )
        })
    },
    create: ({
        id,
        fullname,
        password,
        email,
        company,
        phonenumber,
        position,
        role,
        active
    }) =>{
        return new Promise ((resolve, reject) =>{
            db.query(
                `INSERT INTO recruiter (id, fullname, password, email, company, phonenumber, position, role, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9)`,
                [
                    id,
                    fullname,
                    password,
                    email,
                    company,
                    phonenumber,
                    position,
                    role, 
                    active
                ],
                (err, result) =>{
                    if(!err){
                        resolve(result)
                    }else{
                        reject(new Error('data error disini'))
                    }
                }
            )
        })
    },
     updatePicture : (id, file) =>{
        return new Promise((resolve, reject) =>{
            db.query(`UPDATE recruiter SET image = $1 WHERE id=$2`,[file, id], (err, result) =>{
                if(!err){
                    resolve(result)
                }else{
                    reject(new Error(err))
                }
            })
        })
    },
    updateProfile: ({
        fullname,
        company,
        phonenumber,
        position,
        email,
        company_field,
        address,
        company_description,
        instagram,
        linkedin,
        id,
    })=>{
        return new Promise((resolve, reject) =>{
            db.query(
                `UPDATE recruiter SET fullname = COALESCE($1, fullname),
                company = COALESCE($2, company),
                phonenumber = COALESCE($3, phonenumber),
                position= COALESCE($4, position),
                email= COALESCE($5, email),
                company_field = COALESCE($6, company_field),
                address = COALESCE($7, address),
                company_description = COALESCE($8, company_description),
                instagram = COALESCE($9, instagram),
                linkedin = COALESCE($10, linkedin)
                WHERE id = $11
                `,
                [
                    fullname,
                    company,
                    phonenumber,
                    position,
                    email,
                    company_field,
                    address,
                    company_description,
                    instagram,
                    linkedin,
                    id,
                ],
                (err, result) =>{
                    if(!err){
                        resolve(result.rows)
                    }else{
                        reject(new Error(err))
                    }
                }
            )
        })
    },
    getProfile : (id) =>{
        return new Promise((resolve, reject) =>{
            db.query(
                // `SELECT worker.id, worker.fullname, worker.email, worker.skill, worker.address, worker.
                // description,worker.image, worker.jobs, portfolio.name_app, portfolio.repository, portfolio.type, experience.
                // job_description, experience.month_year, experience.name_company, experience.
                // position FROM worker FULL JOIN experience ON worker.id = experience.id_worker FULL JOIN portfolio ON worker.id = portfolio.id_worker WHERE worker.id = $1`,
                `select * from recruiter where id=$1`,
                [id],
                (err, result) =>{
                    if(!err){
                        resolve(result)
                    }else{
                        reject(new Error(err))
                    }
                }
            )
        })
    },
    changePassword: (body) =>{
        return new Promise((resolve, reject) =>{
            const qs = `SELECT email FROM recruiter WHERE id = $1`
            db.query(qs, [body.id], (_err, data) =>{
                // console.log(data)
                if(!data.rows[0]){
                    bcrypt.genSalt(10, (_err, salt) =>{
                        if(_err){
                            reject(_err)
                        }
                        const {password, email} = body
                        bcrypt.hash(password, salt, (err, hashedPassword) =>{
                            if(err){
                                reject(err)
                            }
                            const queryString = 'UPDATE recruiter SET password = $1 WHERE email= $2'
                            db.query(queryString, [hashedPassword, email], (err, data) =>{
                                if(!err){
                                    resolve({
                                        msg: "change Password success"
                                    })
                                }else{
                                    reject(err)
                                }
                            })
                        })
                    } )
                }else{
                    reject(_err)
                }
            })
        })
    }
}

module.exports = {
    authModel
}