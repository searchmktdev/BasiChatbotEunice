//import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils} from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { MetaProvider as Provider } from '@builderbot/provider-meta'

const PORT = process.env.PORT ?? 3008

const buttonPromo = addKeyword("Precios y Promos")
    .addAnswer(
        [
            `💜 *Contamos con dos paquetes ginecológicos:*`,

            `🔹 *Paquete Básico*  
            ✅ Consulta  
            ✅ Papanicolau  
            ✅ Colposcopía  
            💰 *Precio:* $1,300  
            📄 *Los reportes se envían por WhatsApp.*`,

            `🔹 *Paquete Completo*  
            ✅ Consulta  
            ✅ Exploración mamaria  
            ✅ Papanicolau  
            ✅ Colposcopía  
            ✅ Ultrasonido (rastreo)  
            💰 *Precio:* $1,500`,

            `🔹 *Consulta Básica*  
            💰 *Precio:* $1,000` 
        ]
    )
    .addAnswer("¿Te gustaría agendar una cita? al seleccionar (Agendar Cita), te preguntaremos que servicio te interesa. ",
            {
                capture: true,
                buttons:[
                    { body: `Agendar Cita` },
                    { body: `Menú` }
                 ]
            }, null
        )

    const buttonHor = addKeyword("Horarios")
        .addAnswer(
        [
                    `🏥 *Hospital Ángeles Metropolitano*  
            📍 *Dirección:* 
            -Tlacotalpan 59, Roma Sur, Cuauhtémoc, 06760  
            🕒 *Horarios:*  
            - Lunes a viernes: 9:00 AM - 2:00 PM  
            - Sábados: 9:00 AM - 2:00 PM`,
            
                    `🏥 *Hospital Ángeles Universidad*  
            📍 *Dirección:* 
            -Av. Universidad 1080, Xoco, Benito Juárez, 03330  
            🕒 *Horarios:*  
            - Lunes y jueves: 4:00 PM - 8:00 PM`
        ]
        )
        .addAnswer("¿Te gustaría agendar una cita?",
            {
                capture: true,
                buttons:[
                    { body: `Precios y Promos` },
                    { body: `Agendar Cita` },
                    { body: `Menú` }
                 ]
            }, null
        )
    

        const buttonCita = addKeyword("Agendar Cita")
        .addAnswer(`✨ *Excelente, para agendar tu cita solo necesitamos algunos datos:*`)
    
        .addAnswer(`📝 *¿Podrías darnos tu nombre completo?*`, { capture: true }, async (ctx, { state }) => {
            await state.update({ name: ctx.body });
        })
    
        .addAnswer(`🎂 *¿Podrías proporcionarnos tu edad?*`, { capture: true }, async (ctx, { state }) => {
            await state.update({ age: ctx.body });
        })
    
        .addAnswer(`💉 *¿Qué servicio te interesa?(paquete básico, completo o consulta regular*`, { capture: true }, async (ctx, { state }) => {
            await state.update({ service: ctx.body });
        })
    
        .addAnswer(`📅 *¿Qué día deseas agendar tu consulta?*`, { capture: true }, async (ctx, { state }) => {
            await state.update({ date: ctx.body });
        })
    
        .addAnswer(`🕒 *¿A qué hora deseas tu consulta?*`, { capture: true }, async (ctx, { state }) => {
            await state.update({ time: ctx.body });
        })
    
        .addAnswer(
            `🏥 *¿En qué hospital deseas tu consulta?*  
            1️⃣ *Hospital Ángeles Metropolitano*  
            2️⃣ *Hospital Ángeles Universidad* ` ,

            { capture: true }, async (ctx, { state }) => {
                await state.update({ location: ctx.body });
            }
        )
    
        .addAction(async (_, { flowDynamic, state }) => {
            const name = state.get('name');
            const age = state.get('age');
            const service = state.get('service');
            const date = state.get('date');
            const time = state.get('time');
            const location = state.get('location');
    
            await flowDynamic([
                `✅ *Confirmación de cita:*`,
                `👤 *Nombre:* ${name}`,
                `🎂 *Edad:* ${age}`,
                `💉 *Servicio solicitado:* ${service}`,
                `📅 *Fecha:* ${date}`,
                `🕒 *Hora:* ${time}`,
                `${location}`,
                `📌 *En breve la doctora o alguien de nuestro personal verificará la disponibilidad para confirmarte la cita
                o proponerte otra alternativa, ¡muchas gracias!*`
            ]);
        });

//flujo de bienvenida
const welcomeFlow = addKeyword(['hi', 'hello', 'hola', '¿podrías darme más información?', 'Menú'])
    .addAnswer(`🙌 Soy la asistente de la Doctora Eunice`)
    .addAnswer("Selecciona una opción a continuación",
            {
                capture: true,
                buttons:[
                    { body: `Precios y Promos` },
                    { body: `Horarios` },
                    { body: `Agendar Cita` },
                 ]
            }, null, 
            [buttonPromo, buttonHor, buttonCita]
    )
    

const main = async () => {
    const adapterFlow = createFlow([welcomeFlow])
    const adapterProvider = createProvider(Provider, {
        jwtToken: 'EAANjMtj82DABO0Fq6oIFVG7B4ZBYqZB7YTXXse9OwIWgvvMfopSVmZA6XIZAqUduJsJEPfSZAsFZBu1etmZBlKisOfMkL8qZBdrqvbZBoA1Se03EZC5lhz9jS3NzkghbFLsTwxJWvnG7q2l3LNxm8iZAW1GlCkJ1yANJkjbldWmUCEGvASugBQwXnpcT6ouBKvoRXAZCGXTHvsfQlZCDZBnKGoZAASEHAlVP0oZD',
        numberId: '570372992819996',
        verifyToken: 'eunice',
        version: 'v21.0'
    })
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    httpServer(+PORT)
}

main()