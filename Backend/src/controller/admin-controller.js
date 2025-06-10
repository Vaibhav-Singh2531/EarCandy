import { Song } from "../models/song-model.js"
import { Album } from "../models/album-model.js"
import cloudinary from "../lib/cloudinary.js"
import dotenv from "dotenv";
dotenv.config();

const uploadToCloudinary = async (file) => {
    try {

        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            resource_type: "auto",
        })

        return result.secure_url

    } catch (error) {
        console.log("Error in uploadToCloudinary", error);
        throw new Error("Error uploading to cloudinary");
    }
}

export const createSong = async (req, res, next) => {
    try {

        if (!req.files || !req.files.audioFile || !req.files.imageFile) {
            return res.status(400).json({ message: "All files must be provided" });
        }


        const { title, artist, albumId, duration } = req.body;
        const audioFile = req.files.audioFile;
        const imageFile = req.files.imageFile;

        const audioUrl = await uploadToCloudinary(audioFile);
        const imageUrl = await uploadToCloudinary(imageFile);

        const song = new Song({
            title,
            artist,
            audioUrl,
            imageUrl,
            duration,
            albumId: albumId || null,
        })

        await song.save();

        if (albumId) {
            await Album.findByIdAndUpdate(albumId, {
                $push: { songs: song._id },
            });
        }

        res.status(201).json(song);

    } catch (error) {
        console.log("Error in creatSong", error);
        next(error);
    }
};

export const deleteSong = async (req, res, next) => {
    try {

        const { id } = req.params;

        const song = await Song.findById(id);

        if (song.albumId) {
            await Album.findByIdAndUpdate(song.albumId, {
                $pull: { songs: song._id },
            })
        }
        await Song.findByIdAndDelete(id);
        res.status(200).json({ message: "Song deleted successfully" });

    } catch (error) {
        console.log("Error in deleting Song");
        next(error);
    }
}

export const createAlbums = async (req, res, next) => {

    try {

        const { title, artist, releaseYear } = req.body;
        const { imageFile } = req.files;

        const imageUrl = uploadToCloudinary(imageFile);

        const album = new Album({
            title,
            artist,
            imageUrl,
            releaseYear,
        });

        await album.save();

        res.status(201).json(album);

    } catch (error) {
        console.log("Error in createAlbum", error);
        next(error);
    }

}

export const deleteAlbums = async (req, res, next) => {
    try {

        const { id } = req.params;
        await Song.deleteMany({ albumId: id });
        await Album.findByIdAndDelete(id);
        res.status(200).json({ message: "Album deleted successfully" });

    } catch (error) {
        console.log("Error in deleting Album", error);
         throw new Error("Error in admin-con deleteAlbums");
        next(error);

    }
}

export const checkAdmin = async (req, res, next) => {
    res.status(200).json({ admin: true });
}