# Setup de Supabase

## 1. Crear las tablas

```bash
npx supabase login
npx supabase link --project-ref <tu-project-ref>
npx supabase db execute -f supabase/schema.sql
```

El `project-ref` es el ID que aparece en la URL del dashboard: `supabase.com/dashboard/project/<esto>`.

Para verificar, abre el dashboard y comprueba en **Table Editor** que se crearon las 6 tablas y en **Authentication → Policies** que cada una tiene sus políticas RLS.

## 2. Configurar Auth (admin)

El panel de admin usa Supabase Auth para proteger las operaciones de lectura y escritura de datos paper.

### Crear el usuario admin

1. Ve a **Authentication → Users**
2. Pulsa **Add User → Create new user**
3. Rellena:
   - Email: el email que quieras usar como admin (ej. `admin@tudominio.com`)
   - Password: una contraseña segura
   - Marca **Auto Confirm User** para que no necesite verificar email
4. Pulsa **Create User**

### Desactivar registros públicos (importante)

Para que nadie pueda crearse una cuenta y acceder como authenticated:

1. Ve a **Authentication → Providers**
2. En **Email**, desactiva **Enable Sign Up** (deja solo el login)
3. Pulsa **Save**

Así solo el usuario que creaste manualmente puede loguearse.

## 3. Variables de entorno

En tu `.env` local (y en el hosting de producción):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Estas las encuentras en **Settings → API** dentro de tu proyecto.

Ya no necesitas `VITE_ADMIN_PASSWORD`. La autenticación la gestiona Supabase Auth.
