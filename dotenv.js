/**
 * Carga variables de entorno desde un archivo .env en el navegador.
 */
export default {
    config: async () => {
        try {
            const response = await fetch('.env');
            if (!response.ok) {
                console.warn('No se pudo encontrar el archivo .env');
                return;
            }
            const text = await response.text();
            
            // Inicializar process.env si no existe
            if (typeof window.process === 'undefined') {
                window.process = { env: {} };
            } else if (typeof window.process.env === 'undefined') {
                window.process.env = {};
            }

            text.split('\n').forEach(line => {
                // Eliminar comentarios y espacios en blanco
                const cleanLine = line.split('#')[0].trim();
                if (!cleanLine) return;

                const [key, ...valueParts] = cleanLine.split('=');
                const key_trimmed = key.trim();
                let value = valueParts.join('=').trim();

                // Eliminar comillas si existen
                if ((value.startsWith('"') && value.endsWith('"')) || 
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                window.process.env[key_trimmed] = value;
            });
            
            console.log('✅ Variables de entorno cargadas correctamente.');
        } catch (error) {
            console.error('❌ Error cargando .env:', error);
        }
    }
};
