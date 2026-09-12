import { Link } from 'react-router-dom'
import { Sparkles, LogIn, UserPlus } from 'lucide-react'
import {
  Container,
  Stack,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from '../components'
import { ROUTES } from '../constants/routes'

import { WheatIcon } from '../components/common/Icons'

function HomePage() {
  return (
    <Container size="sm">
        <Card>
          <CardHeader className="text-center items-center">
            <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-xs">
              <WheatIcon className="w-8 h-8 text-emerald-700" />
            </div>
            <CardTitle>PashuChara</CardTitle>
            <CardDescription>
              AI-driven animal feed formulation and cattle ration optimization platform.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Stack direction="col" spacing="sm">
              <Link to={ROUTES.LOGIN} className="w-full">
                <Button variant="primary" fullWidth rightIcon={<LogIn className="w-4 h-4" />}>
                  Go to Login
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER} className="w-full">
                <Button variant="outline" fullWidth rightIcon={<UserPlus className="w-4 h-4" />}>
                  Go to Register
                </Button>
              </Link>
            </Stack>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Badge variant="brand" dot icon={<Sparkles className="w-3 h-3 mr-1" />}>
              Responsive Layout Ready
            </Badge>
          </CardFooter>
        </Card>
    </Container>
  )
}

export default HomePage
