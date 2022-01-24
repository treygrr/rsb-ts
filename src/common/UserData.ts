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
            if (request.status === 200) {
                const data = await request.json();
                return data;
            }
        throw new Error('Request failed when searching for user 😱');
        } catch (error) {
            const errors = {
                error
            }
            return errors;
        }
    }

    getFormattedSkillsData() {
    
    }

    getSkillById(skillId: number) {
        //return this.getSkills().find(skill => skill.id === skillId);
    }
}