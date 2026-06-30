export class Player {
  private name: string;
  private _username: string;
  private _team: "WHITE" | "BLACK";
  private _id: number;
  constructor(
    name: string,
    _username: string,
    _team: "WHITE" | "BLACK",
    id: number,
  ) {
    this.name = name;
    this._username = _username;
    this._team = _team;
    this._id = id;
  }

  get username() {
    return this._username;
  }

  get team() {
    return this._team;
  }

  get id() {
    return this._id;
  }
}
