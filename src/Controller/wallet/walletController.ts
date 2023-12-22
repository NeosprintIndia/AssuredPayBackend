import { Request, Response } from "express";
// Create a new wallet entry
import mongoose, { Schema, ObjectId, Document, Model, Types, } from 'mongoose';
import walletModel from "../../models/walletModel";

export async function postwallet(req: Request, res: Response) {
    try {
        const wallet = new walletModel(req.body);
        const savedWallet = await wallet.save();
        res.json(savedWallet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export async function getAllwallet(req: Request, res: Response) {
    try {
        const wallets = await walletModel.find();
        res.json(wallets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export async function getwalletbyid(req: Request, res: Response) {
    try {
        const wallet = await walletModel.findById(req.params.id);
        res.json(wallet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function updatewalletbyid(req: Request, res: Response) {
    try {
        const wallet = await walletModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(wallet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export async function deletewalletbyid(req: Request, res: Response) {
    try {
        const wallet = await walletModel.findByIdAndDelete(req.params.id);
        res.json(wallet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}






