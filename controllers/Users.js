import Users from "../models/UserModel.js";

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: [
        "id",
        "username",
        "name",
        "role",
        "level",
        "aktif_sejak",
        "whatsapp",
        "telp",
        "email",
        "status",
      ],
    });
    res.json(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: `No data found` });
  }
};

export const getUserById = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: [
        "id",
        "username",
        "name",
        "role",
        "level",
        "aktif_sejak",
        "whatsapp",
        "telp",
        "email",
        "status",
      ],
      where: {
        id: req.params.id,
      },
    });
    res.json(users);
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ msg: `User not found` });
  }
};

export const getUserByEmail = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: [
        "id",
        "username",
        "name",
        "role",
        "level",
        "aktif_sejak",
        "whatsapp",
        "telp",
        "email",
        "status",
      ],
      where: {
        email: req.body.email,
      },
    });
    res.json(users);
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ msg: `User not found` });
  }
};

export const updateUser = async (req, res) => {
  try {
    const {
      id,
      username,
      name,
      role,
      level,
      aktif_sejak,
      whatsapp,
      telp,
      email,
      status,
    } = req.body;
    await Users.update(
      {
        username: username,
        name: name,
        role: role,
        level: level,
        aktif_sejak: aktif_sejak,
        whatsapp: whatsapp,
        telp: telp,
        email: email,
        status: status,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.status(200).json({ msg: `${name} success updated` });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: `update failed` });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await Users.destroy({ where: { id: req.params.id } });
    res.status(200).json({ msg: `User deleted` });
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ msg: `User not found` });
  }
};
