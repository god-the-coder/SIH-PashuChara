import { Link } from 'react-router-dom'
import { LogIn, ArrowLeft } from 'lucide-react'
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

function LoginPage() {
  return (
    <Container size="sm">
        <Card>
          <CardHeader className="text-center items-center">
            <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-xs">
              <LogIn className="w-6 h-6" />
            </div>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Access your PashuChara-AI dairy and feed formulation workspace.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Stack direction="col" spacing="sm">
              <Link to={ROUTES.REGISTER} className="w-full">
                <Button variant="outline" fullWidth>
                  Don't have an account? Register
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

export default LoginPage
