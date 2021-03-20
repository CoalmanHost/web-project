export class PlayerModel {
    toJson()
    {
        return {
            name : this.name,
            registerDate : this.regDate,
            email : this.email
        }
    }
}