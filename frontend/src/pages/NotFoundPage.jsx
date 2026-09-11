import { Link } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'
import {
  Container,
  Stack,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from '../components'
import { ROUTES } from '../constants/routes'

function NotFoundPage() {
  return (
    <Container size="sm">
        <Card className="text-center">
          <CardHeader className="text-center items-center">
            <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <CardTitle className="text-3xl">404</CardTitle>
            <CardDescription>
              The page you are looking for does not exist or has been moved.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Stack direction="col" spacing="sm">
              <Link to={ROUTES.HOME} className="w-full">
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<Home className="w-4 h-4" />}
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

export default NotFoundPage
