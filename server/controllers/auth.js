import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import jwt_decode from "jwt-decode";

import User from '../models/user.js';
import Chat from '../models/Chat.js';
import { json } from 'sequelize';

const signup = (req, res, next) => {
    // checks if email already exists
    User.findOne({ where : {
        email: req.body.phone, 
    }})
    .then(dbUser => {
        if (dbUser) {
            return res.status(409).json({message: "email already exists"});
        } else if (req.body.phone && req.body.password) {
            // password hash
            bcrypt.hash(req.body.password, 12, (err, passwordHash) => {
                if (err) {
                    return res.status(500).json({message: "couldnt hash the password"}); 
                } else if (passwordHash) {
                    return User.create(({
                        // email: req.body.email,
                        email: req.body.phone,
                        name: req.body.name,
                        password: passwordHash,
                    }))
                    .then(() => {
                        res.status(200).json({message: "user created"});
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(502).json({message: "error while creating the user"});
                    });
                };
            });
        } else if (!req.body.password) {
            return res.status(400).json({message: "password not provided"});
        } else if (!req.body.phone) {
            return res.status(400).json({message: "Phone Number not provided"});
        };
    })
    .catch(err => {
        console.log('error', err);
    });
};

const login = (req, res, next) => {
    // checks if email exists
    User.findOne({ where : {
        email: req.body.phone, 
    }})
    .then(dbUser => {
        if (!dbUser) {
            return res.status(404).json({message: "user not found"});
        } else {
            // password hash
            bcrypt.compare(req.body.password, dbUser.password, (err, compareRes) => {
                if (err) { // error while comparing
                    res.status(502).json({message: "error while checking user password"});
                } else if (compareRes) { // password match
                    const token = jwt.sign({ email: req.body.phone }, 'secret', { expiresIn: '1h' });
                    
                    res.status(200).json({message: "user logged in", "token": token, "username": dbUser.name});
                } else { // password doesnt match
                    res.status(401).json({message: "invalid credentials"});
                };
            });
        };
    })
    .catch(err => {
        console.log('error', err);
    });
};

const isAuth = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        return res.status(401).json({ message: 'not authenticated' });
    };
    const token = authHeader.split(' ')[1];
    let decodedToken; 
    try {
        decodedToken = jwt.verify(token, 'secret');
    } catch (err) {
        return res.status(500).json({ message: err.message || 'could not decode the token' });
    };
    if (!decodedToken) {
        res.status(401).json({ message: 'unauthorized' });
    } else {
        res.status(200).json({ message: 'here is your resource' });
    };
};

const sendMessage = (req, res, next) => {
    // res.status(200).json({ message: "here is your public resource" });
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        return res.status(401).json({ message: 'not authenticated' });
    };
    const token = authHeader.split(' ')[1];
    let decodedToken; 
    try {
        decodedToken = jwt.verify(token, 'secret');
    } catch (err) {
        return res.status(500).json({ message: err.message || 'could not decode the token' });
    };
    if (!decodedToken) {
        // console.log(decodedToken);
        res.status(401).json({ message: 'unauthorized' });
    } else {
        ////////////////////////////////////////////////
        User.findOne({ where : {
            email: req.body.reciever, 
        }})
        .then(dbUser => {
            if (!dbUser) {
                return res.status(404).json({message: "user not found"});
            } else {
                // password hash
                // bcrypt.compare(req.body.password, dbUser.password, (err, compareRes) => {
                //     if (err) { // error while comparing
                //         res.status(502).json({message: "error while checking user password"});
                //     } else if (compareRes) { // password match
                //         const token = jwt.sign({ email: req.body.phone }, 'secret', { expiresIn: '1h' });
                //         res.status(200).json({message: "user logged in", "token": token, "username": dbUser.name});
                //     } else { // password doesnt match
                //         res.status(401).json({message: "invalid credentials"});
                //     };
                // });
                if( req.body.message ){

                    User.findOne({ where : {
                        email: decodedToken.email, 
                    }})
                    .then(dbUser => {
                        if (!dbUser) {
                            res.status(404).json({ message:  "something went wrong" });
                        } else {
                            // res.status(200).json({ message: dbUser.email });
                            // sender = dbUser.id;
                            User.findOne({ where : {
                                email: req.body.reciever, 
                            }})
                            .then(dbUserR => {
                                if (!dbUserR) {
                                    res.status(404).json({ message:  "reciever does not exist" });
                                } else {
                                    if( dbUser.id === dbUserR.id )
                                        res.status(404).json({ message:  "you cant send message to your self" });
                                    // reciever = dbUser.id;
                                    //////////////////////////////
                                    else{
                                        Chat.create(({
                                            // email: req.body.email,
                                            sender: dbUser.id,
                                            reciever: dbUserR.id,
                                            message: req.body.message,
                                        }))
                                        .then(() => {
                                            res.status(200).json({message: "Message sent"});
                                        })
                                        .catch(err => {
                                            console.log(err);
                                            res.status(502).json({message: "error while sending message"});
                                        });
                                    }
                                    //////////////////////////////////
                                }
                            });
                            ///////////////
                        }
                    });
                    // console.log(decodedToken.email);
                    
                    // Chat.create(({
                    //     // email: req.body.email,
                    //     sender: req.body.phone,
                    //     reciever: req.body.reciever,
                    //     message: req.body.message,
                    // }))
                    // .then(() => {
                    //     res.status(200).json({message: "user created"});
                    // })
                    // .catch(err => {
                    //     console.log(err);
                    //     res.status(502).json({message: "error while creating the user"});
                    // });
                } else{
                res.status(200).json({ message: ' sent to '+req.body.reciever });
                }
            };
        })
        .catch(err => {
            console.log('error', err);
        });
        //////////////////////////////////////////////////
        // res.status(200).json({ message: 'message sent' });
    };
};


const getAllMessages = (req, res, next) => {
    
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        return res.status(401).json({ message: 'not authenticated' });
    };
    const token = authHeader.split(' ')[1];
    let decodedToken; 
    try {
        decodedToken = jwt.verify(token, 'secret');
    } catch (err) {
        return res.status(500).json({ message: err.message || 'could not decode the token' });
    };
    if (!decodedToken) {
        // console.log(decodedToken);
        res.status(401).json({ message: 'unauthorized' });
    } else {
        User.findOne({ where : {
            email: decodedToken.email, 
        }})
        .then(dbUser => {
            if (!dbUser) {
                res.status(404).json({ message:  "something went wrong" });
            } else {
                Chat.findAll({
                    where:{
                        reciever:dbUser.id,
                    }
                }).then( allResults =>{
                    // console.log(allResults[0][0]);
                    //  chatdata = 'ssss';
                    allResults.forEach(el => {
                        User.findOne({ where : {
                            id: el.sender, 
                        }}).then( sender=>{
                            if (!sender) {
                                res.status(404).json({ message:  "somethin" });
                            }else{
                                res.status(200).json({ message: sender });
                            }
                        });
                    });
                    
                });
                
            }
        }).catch(err => {
            console.log('error', err);
        });
    }
};

export { signup, login, isAuth, sendMessage, getAllMessages };