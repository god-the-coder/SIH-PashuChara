import { Link } from 'react-router-dom'
import { UserPlus, ArrowLeft } from 'lucide-react'
import {
  Container,
  Stack,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Divider,
} from '../components'
import { ROUTES } from '../constants/routes'

function RegisterPage() {
  return (
    <Container size="sm">
        <Card>
          <CardHeader className="text-center items-center">
            <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-xs">
              <UserPlus className="w-6 h-6" />
            </div>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Join PashuiChara to optimize ration costs and animal productivity.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Stack direction="col" spacing="sm">
              <Link to={ROUTES.LOGIN} className="w-full">
                <Button variant="outline" fullWidth>
                  Already have an account? Sign In
                </Button>
              </Link>

              <Divider label="or" />

              <Link to={ROUTES.HOME} className="w-full">
                <Button
                  variant="ghost"
                  fullWidth
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Home
                </Button>
              </Link>
            </Stack>
          </CardContent>
        </Card>
    </Container>
  )
}

export default RegisterPage
