const Sauce = require("../models/sauce");
const fs = require("fs");
const sauce = require("../models/sauce");


//Ajout d'une nouvelle sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    });
    
    sauce.save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée" }))
    .catch((error) => res.status(400).json({ error }));
};


//Recupération de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};


//Recupération d'une sauce grâce à son ID
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }));
};


//Modification d'une sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};

    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
            res.status(401).json({ message: "Non-autorisé" });
        }
        else {
            Sauce.updateOne({ _id: req.params.id}, {...sauceObject, _id: req.params.id})
            .then(() => res.status(200).json({ message: 'Sauce modifiée'}))
            .catch(error => res.status(401).json({ error }));
        }
    })
    .catch((error) => { res.status(400).json({ error });
    })  ;
};


//Suppression d'une sauce
exports.deleteSauce = (req , res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then((sauce) => {
            if (!sauce) {
                return res.status(404).json({ error: "Sauce introuvable"});
            }
            if (sauce.userId !== req.auth.userId) {
                return res.status(401).json({ error: 'Non autorisé'});
            }
            else {
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'sauce supprimée '}))
                        .catch((error) => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => res.status(500).json({ error }));
};


//Gestion Likes/Dislikes
exports.rateSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(function (likedSauce) {
        switch (req.body.like) {
          //L'utilisateur like une sauce (+1)
          case 1:
            if (
              !likedSauce.usersLiked.includes(req.body.userId) &&
              req.body.like === 1
            ) {
              Sauce.updateOne(
                { _id: req.params.id },
                {
                  $inc: { likes: 1 },
                  $push: { usersLiked: req.body.userId },
                }
              )
                .then(() => { res.status(201).json({ message: "Like ajouté a la sauce!" });})
                .catch((error) => { res.status(400).json({ error });});
            }
            break;
          
            // L'utilisateur dislike une sauce (-1)
          case -1:
            if (
              !likedSauce.usersDisliked.includes(req.body.userId) &&
              req.body.like === -1
            ) {
              Sauce.updateOne(
                { _id: req.params.id },
                {
                  $inc: { dislikes: 1 },
                  $push: { usersDisliked: req.body.userId },
                }
              )
                .then(() => { res.status(201).json({ message: "Dislike ajouté à la sauce !" });})
                .catch((error) => { res.status(400).json({ error });});
            }
            break;
          
            // Retrait Like/Dislike /// Switch Like/Dislike Neutre (0)
          case 0:
            if (likedSauce.usersLiked.includes(req.body.userId)) {
              Sauce.updateOne(
                { _id: req.params.id },
                { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
              )
                .then(() => { res.status(201).json({ message: "Like retiré !" });})
                .catch((error) => { res.status(400).json({ error });});
            }
            
            if (likedSauce.usersDisliked.includes(req.body.userId)) {
              Sauce.updateOne(
                { _id: req.params.id },
                {
                  $inc: { dislikes: -1 },
                  $pull: { usersDisliked: req.body.userId },
                }
              )
                .then(() => { res.status(201).json({ message: "Dislike retiré !" });})
                .catch((error) => { res.status(400).json({ error });});
            }
            break;
        }
      })
      .catch((error) => { res.status(404).json({ error });});
  };