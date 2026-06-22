export class Player {
  private name: string;
  private _username: string;
  private _team: "WHITE" | "BLACK";
  constructor(name: string, _username: string, _team: "WHITE" | "BLACK") {
    this.name = name;
    this._username = _username;
    this._team = _team;
  }

  get username() {
    return this._username;
  }

  get team() {
    return this._team;
  }
}
