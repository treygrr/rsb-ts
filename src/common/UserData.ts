import fetch from 'node-fetch';

export class UserData {
    userName: string;
    constructor(userName: string) {
        if (!userName) {
            throw new Error('No user name provided');
        }
        this.userName = userName;
    }
    async getUserData() {
        try {
            const request = await fetch(`https://apps.runescape.com/runemetrics/profile/profile?user=${this.userName}&activities=20`);
            const data = await request.json();
            return data;
        } catch (error: any) {
            console.log(error);
        }
    }

    getFormattedSkillsData() {
    
    }

    getSkillById(skillId: number) {
        //return this.getSkills().find(skill => skill.id === skillId);
    }
}