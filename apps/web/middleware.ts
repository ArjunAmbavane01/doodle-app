export {default} from 'next-auth/middleware'

export const config = {
    matcher : ['/canvas','/canvas/:roomId'],
}